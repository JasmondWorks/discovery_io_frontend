# Complete Auth & React Query API Client Setup — Agent Instructions

## Overview

This document is a complete, step-by-step implementation guide for an application using:

- **A robust Axios API client** (abort control, request logging, automatic token refresh via interceptors)
- **React Query** (for all data fetching, global caching, background refetching, and mutations)
- **In-memory access token storage** via React Context (never localStorage)
- **Session preservation** via httpOnly refresh token cookie (set by backend)
- **Role-based protected routes**

Follow every section in order to implement the secure API layer natively with React Query.

---

## Architecture Decision Log

| Concern               | Decision                              | Reason                                                     |
| --------------------- | ------------------------------------- | ---------------------------------------------------------- |
| Data Fetching / Cache | React Query (`@tanstack/react-query`) | Built-in deduplication, background freshness, auto-retries |
| Access token storage  | React Context (memory)                | XSS-safe, never hits disk                                  |
| Refresh token storage | httpOnly cookie (backend sets it)     | JS cannot read it, survives page refresh                   |
| Token refresh trigger | Axios response interceptor (401)      | Transparent to all React Query hooks                       |
| Error logging         | Custom `withLogger`                   | Centralized tracking, active only in dev                   |

---

## Step 1 — Dependencies

Install standard routing, api fetching, and React Query stack:

```bash
npm install axios react-router-dom @tanstack/react-query @tanstack/react-query-devtools
npm install -D @types/react-router-dom
```

---

## Step 2 — Environment & Constants

Add to `.env` or `.env.local`:

```env
VITE_API_URL=https://discovery-io-backend.vercel.app/api/v1
VITE_DEBUG_API=true
```

### `src/constants/roles.ts`

```ts
export const ROLES = {
  ADMIN: "admin",
  EDITOR: "editor",
  VIEWER: "viewer",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
```

---

## Step 3 — React Query Configuration

### `src/lib/react-query.ts`

```ts
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Only retry once by default on failure
      refetchOnWindowFocus: false, // Prevents excessive refetches, activate per hook if necessary
      staleTime: 5 * 60 * 1000, // Cache remains fresh for 5 minutes
    },
  },
});
```

---

## Step 4 — Auth Context (In-Memory Access Tokens)

### `src/context/AuthContext.tsx`

```tsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import type { Role } from "../constants/roles";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isInitialised: boolean;
}

interface AuthContextValue extends AuthState {
  setAuth: (user: AuthUser, accessToken: string) => void;
  clearAuth: () => void;
  accessTokenRef: React.MutableRefObject<string | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuthState] = useState<AuthState>({
    user: null,
    accessToken: null,
    isInitialised: false,
  });

  const accessTokenRef = useRef<string | null>(null);

  const setAuth = useCallback((user: AuthUser, accessToken: string) => {
    accessTokenRef.current = accessToken;
    setAuthState({ user, accessToken, isInitialised: true });
  }, []);

  const clearAuth = useCallback(() => {
    accessTokenRef.current = null;
    setAuthState({ user: null, accessToken: null, isInitialised: true });
  }, []);

  useEffect(() => {
    let cancelled = false;

    const silentRefresh = async () => {
      try {
        const { refreshToken } = await import("../api/authApi");
        const data = await refreshToken();
        if (!cancelled) setAuth(data.user, data.accessToken);
      } catch {
        if (!cancelled)
          setAuthState((prev) => ({ ...prev, isInitialised: true }));
      }
    };

    silentRefresh();
    return () => {
      cancelled = true;
    };
  }, [setAuth]);

  return (
    <AuthContext.Provider
      value={{ ...auth, setAuth, clearAuth, accessTokenRef }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
```

---

## Step 5 — The Core Axios Instance

### `src/api/api.ts`

```ts
import axios from "axios";
import type {
  AxiosInstance,
  AxiosRequestConfig,
  CancelTokenSource,
} from "axios";

type AbortFn = (cancel: () => void) => void;

interface ExtendedConfig extends AxiosRequestConfig {
  abort?: AbortFn;
  _retry?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
export const isApiError = (
  error: unknown,
): error is import("axios").AxiosError => axios.isAxiosError(error);
export const didAbort = (error: unknown) =>
  axios.isCancel(error) ? { aborted: true } : false;
const getCancelSource = (): CancelTokenSource => axios.CancelToken.source();

// ─── withAbort ────────────────────────────────────────────────────────────────
const withAbort = <T>(fn: (...args: unknown[]) => Promise<T>) => {
  return async (...args: unknown[]): Promise<T> => {
    const originalConfig = args[args.length - 1] as ExtendedConfig;
    const { abort, ...config } = originalConfig;

    if (typeof abort === "function") {
      const { cancel, token } = getCancelSource();
      config.cancelToken = token;
      abort(cancel);
    }

    try {
      if (args.length > 2) {
        const [url, body] = args as [string, unknown];
        return await fn(url, body, config);
      } else {
        const [url] = args as [string];
        return await fn(url, config);
      }
    } catch (error) {
      if (didAbort(error)) (error as Record<string, unknown>).aborted = true;
      throw error;
    }
  };
};

// ─── withLogger ───────────────────────────────────────────────────────────────
const withLogger = <T>(promise: Promise<T>): Promise<T> => {
  return promise.catch((error) => {
    if (import.meta.env.VITE_DEBUG_API !== "true") throw error;
    if (axios.isCancel(error)) {
      console.warn("[API] Request cancelled:", error.message);
      throw error;
    }
    if (error.response) {
      console.group(`[API] Error ${error.response.status}`);
      console.error("Data:", error.response.data);
      console.error("Config:", error.config);
      console.groupEnd();
    }
    throw error;
  });
};

// ─── createApiClient ──────────────────────────────────────────────────────────
const axiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // Sends the httpOnly refresh cookie
  headers: { "Content-Type": "application/json" },
});

// ─── Interceptors ─────────────────────────────────────────────────────────────
let _getAccessToken: (() => string | null) | null = null;
let _clearAuth: (() => void) | null = null;
let _navigateToLogin: (() => void) | null = null;

export function setupInterceptors(
  getAccessToken: () => string | null,
  clearAuth: () => void,
  navigateToLogin: () => void,
) {
  _getAccessToken = getAccessToken;
  _clearAuth = clearAuth;
  _navigateToLogin = navigateToLogin;
}

axiosInstance.interceptors.request.use((config) => {
  const token = _getAccessToken?.();
  if (token && config.headers)
    config.headers["Authorization"] = `Bearer ${token}`;
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest: ExtendedConfig = error.config;
    const is401 = error.response?.status === 401;
    const notAlreadyRetried = !originalRequest._retry;
    const notRefreshEndpoint = !originalRequest.url?.includes("/auth/refresh");

    if (is401 && notAlreadyRetried && notRefreshEndpoint) {
      originalRequest._retry = true;
      try {
        const { data } = await axiosInstance.post<{ accessToken: string }>(
          "/auth/refresh",
          {},
          { _retry: true } as ExtendedConfig,
        );
        const newToken = data.accessToken;
        if (_getAccessToken && originalRequest.headers) {
          originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        }
        window.dispatchEvent(
          new CustomEvent("auth:tokenRefreshed", {
            detail: { accessToken: newToken },
          }),
        );
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        _clearAuth?.();
        _navigateToLogin?.();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

const api = {
  get: <T = unknown>(url: string, config: ExtendedConfig = {}) =>
    withLogger(withAbort(axiosInstance.get<T>)(url, config)) as Promise<
      import("axios").AxiosResponse<T>
    >,
  delete: <T = unknown>(url: string, config: ExtendedConfig = {}) =>
    withLogger(withAbort(axiosInstance.delete<T>)(url, config)) as Promise<
      import("axios").AxiosResponse<T>
    >,
  post: <T = unknown>(
    url: string,
    body: unknown = {},
    config: ExtendedConfig = {},
  ) =>
    withLogger(withAbort(axiosInstance.post<T>)(url, body, config)) as Promise<
      import("axios").AxiosResponse<T>
    >,
  patch: <T = unknown>(
    url: string,
    body: unknown = {},
    config: ExtendedConfig = {},
  ) =>
    withLogger(withAbort(axiosInstance.patch<T>)(url, body, config)) as Promise<
      import("axios").AxiosResponse<T>
    >,
  put: <T = unknown>(
    url: string,
    body: unknown = {},
    config: ExtendedConfig = {},
  ) =>
    withLogger(withAbort(axiosInstance.put<T>)(url, body, config)) as Promise<
      import("axios").AxiosResponse<T>
    >,
};

export default api;
```

---

## Step 6 — Base Authentication Endpoints

### `src/api/authApi.ts`

```ts
import api from "./api";
import type { AuthUser } from "../context/AuthContext";

interface LoginPayload {
  email: string;
  password: string;
}
interface AuthResponse {
  user: AuthUser;
  accessToken: string;
}

export const login = (payload: LoginPayload) =>
  api.post<AuthResponse>("/auth/login", payload).then((res) => res.data);
export const refreshToken = () =>
  api.post<AuthResponse>("/auth/refresh", {}).then((res) => res.data);
export const logout = () =>
  api.post("/auth/logout", {}).then((res) => res.data);
export const getMe = () =>
  api.get<AuthUser>("/auth/me").then((res) => res.data);
```

---

## Step 7 — Feature Level React Query Hooks

### Login Hook

```ts
// src/features/auth/hooks/useLogin.ts
import { useMutation } from "@tanstack/react-query";
import { login } from "../../../api/authApi";
import { useAuth } from "../../../context/AuthContext";

export function useLogin() {
  const { setAuth } = useAuth();
  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => setAuth(data.user, data.accessToken),
  });

  return {
    handleLogin: (email: string, password: string) =>
      mutation.mutateAsync({ email, password }),
    isLoginPending: mutation.isPending,
    isLoginError: mutation.isError,
    loginError: mutation.error,
  };
}
```

### Logout Hook

```ts
// src/features/auth/hooks/useLogout.ts
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { logout } from "../../../api/authApi";
import { useAuth } from "../../../context/AuthContext";

export function useLogout() {
  const { clearAuth } = useAuth();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: logout,
    onSettled: () => {
      clearAuth();
      navigate("/login", { replace: true });
    },
  });

  return {
    handleLogout: () => mutation.mutate(),
    isLogoutPending: mutation.isPending,
  };
}
```

---

## Step 8 — Role-Guard Components

### `src/components/ProtectedRoute.tsx`

```tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { Role } from "../constants/roles";

interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, isInitialised } = useAuth();
  const location = useLocation();

  if (!isInitialised) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (allowedRoles && !allowedRoles.includes(user.role))
    return <Navigate to="/" replace />;

  return <Outlet />;
}
```

---

## Step 9 — App Wrapping (Inject QueryClient)

### `src/App.tsx`

```tsx
import { useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "./lib/react-query";
import { setupInterceptors } from "./api/api";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

function AppRoutes() {
  const { accessTokenRef, clearAuth, setAuth, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setupInterceptors(
      () => accessTokenRef.current,
      clearAuth,
      () => navigate("/login", { replace: true }),
    );
  }, [accessTokenRef, clearAuth, navigate]);

  useEffect(() => {
    const handler = (e: Event) => {
      const { accessToken } = (e as CustomEvent).detail;
      if (user) setAuth(user, accessToken);
    };
    window.addEventListener("auth:tokenRefreshed", handler);
    return () => window.removeEventListener("auth:tokenRefreshed", handler);
  }, [user, setAuth]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        {/* Add protected routes here */}
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```
