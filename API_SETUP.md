# Auth & API Client Setup — Agent Instructions

## Overview

This document is a complete, step-by-step implementation guide for:

- A robust Axios API client (abort control, request logging, automatic token refresh, redirect on 401)
- In-memory access token storage (never localStorage)
- Session preservation on page refresh via httpOnly refresh token cookie (set by backend)
- Role-based protected routes
- Reusable async/status hooks for all data fetching

Work through every section in order. Each file path is explicit. Do not skip sections.

---

## Architecture Decision Log

| Concern                  | Decision                              | Reason                                   |
| ------------------------ | ------------------------------------- | ---------------------------------------- |
| Access token storage     | React context (memory)                | XSS-safe, never hits disk                |
| Refresh token storage    | httpOnly cookie (backend sets it)     | JS cannot read it, survives page refresh |
| Session length authority | Backend                               | Backend controls cookie/token TTL        |
| Token refresh trigger    | Axios response interceptor (401)      | Transparent to all call sites            |
| Request cancellation     | AbortController via axios CancelToken | Prevents stale responses                 |
| Error logging            | `withLogger` wrapper                  | Only logs in debug mode                  |
| Status tracking          | `useApiStatus` + `useApi` hooks       | Consistent across features               |

---

## Environment Setup

Add to `.env`:

```env
REACT_APP_API_URL=https://discovery-io-backend.vercel.app/api/v1
REACT_APP_DEBUG_API=true
```

---

## Step 1 — Constants

### `src/constants/api-status.ts`

```ts
export const IDLE = "IDLE";
export const PENDING = "PENDING";
export const SUCCESS = "SUCCESS";
export const ERROR = "ERROR";

export const defaultApiStatuses = [
  "IDLE",
  "PENDING",
  "SUCCESS",
  "ERROR",
] as const;

export type ApiStatusValue = (typeof defaultApiStatuses)[number];

export const apiStatus = {
  IDLE,
  PENDING,
  SUCCESS,
  ERROR,
} as const;
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

## Step 2 — Helpers

### `src/helpers/with-async.ts`

Wraps any async function so you never need try/catch at call sites.
Destructure `{ response, error }` at every usage.

```ts
export async function withAsync<T>(fn: () => Promise<T>): Promise<{
  response: T | null;
  error: unknown | null;
}> {
  try {
    if (typeof fn !== "function") {
      throw new Error("withAsync: argument must be a function");
    }
    const response = await fn();
    return { response, error: null };
  } catch (error) {
    return { response: null, error };
  }
}
```

### `src/helpers/capitalize.ts`

```ts
export const capitalize = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);
```

---

## Step 3 — Auth Context

This is the heart of the auth system. The access token lives ONLY here — in React state.
On mount it silently calls `/auth/refresh` to restore the session using the httpOnly cookie.

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
import { ROLES, type Role } from "../constants/roles";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isInitialised: boolean; // true once the silent refresh attempt has resolved
}

interface AuthContextValue extends AuthState {
  setAuth: (user: AuthUser, accessToken: string) => void;
  clearAuth: () => void;
  // Exposes a ref so the axios interceptor can read the token synchronously
  // without causing re-renders or stale closure issues
  accessTokenRef: React.MutableRefObject<string | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuthState] = useState<AuthState>({
    user: null,
    accessToken: null,
    isInitialised: false,
  });

  // Keep a ref in sync so axios interceptors can read it without closures
  const accessTokenRef = useRef<string | null>(null);

  const setAuth = useCallback((user: AuthUser, accessToken: string) => {
    accessTokenRef.current = accessToken;
    setAuthState({ user, accessToken, isInitialised: true });
  }, []);

  const clearAuth = useCallback(() => {
    accessTokenRef.current = null;
    setAuthState({ user: null, accessToken: null, isInitialised: true });
  }, []);

  // Silent refresh on mount — restores session from httpOnly cookie
  useEffect(() => {
    let cancelled = false;

    const silentRefresh = async () => {
      try {
        // Import here to avoid circular dependency with api.ts
        const { refreshToken } = await import("../api/authApi");
        const data = await refreshToken();
        if (!cancelled) {
          setAuth(data.user, data.accessToken);
        }
      } catch {
        // No valid cookie — treat as logged out
        if (!cancelled) {
          setAuthState((prev) => ({ ...prev, isInitialised: true }));
        }
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

## Step 4 — API Client

This is the most important file. Read every comment carefully.

### `src/api/api.ts`

```ts
import axios from "axios";
import type {
  AxiosInstance,
  AxiosRequestConfig,
  CancelTokenSource,
} from "axios";

// ─── Types ────────────────────────────────────────────────────────────────────

type AbortFn = (cancel: () => void) => void;

interface ExtendedConfig extends AxiosRequestConfig {
  abort?: AbortFn;
  _retry?: boolean; // internal flag: has this request already been retried after 401?
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const isApiError = (
  error: unknown,
): error is import("axios").AxiosError => axios.isAxiosError(error);

export const didAbort = (error: unknown) =>
  axios.isCancel(error) ? { aborted: true } : false;

const getCancelSource = (): CancelTokenSource => axios.CancelToken.source();

// ─── withAbort ────────────────────────────────────────────────────────────────
// Extracts `abort` from the config, wires a CancelToken, then calls the real fn.

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
      // POST/PUT/PATCH have a body as the second arg
      if (args.length > 2) {
        const [url, body] = args as [string, unknown];
        return await fn(url, body, config);
      } else {
        const [url] = args as [string];
        return await fn(url, config);
      }
    } catch (error) {
      if (didAbort(error)) {
        (error as Record<string, unknown>).aborted = true;
      }
      throw error;
    }
  };
};

// ─── withLogger ───────────────────────────────────────────────────────────────
// Logs API errors to console in debug mode, then re-throws for the caller.

const withLogger = <T>(promise: Promise<T>): Promise<T> => {
  return promise.catch((error) => {
    if (!process.env.REACT_APP_DEBUG_API) throw error;

    if (axios.isCancel(error)) {
      console.warn("[API] Request cancelled:", error.message);
      throw error;
    }

    if (error.response) {
      console.group(`[API] Error ${error.response.status}`);
      console.error("Data:", error.response.data);
      console.error("Headers:", error.response.headers);
      console.error("Config:", error.config);
      console.groupEnd();
    } else if (error.request) {
      console.error("[API] No response received:", error.request);
    } else {
      console.error("[API] Request setup error:", error.message);
    }

    throw error;
  });
};

// ─── createApiClient ──────────────────────────────────────────────────────────

const axiosInstance: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true, // CRITICAL: sends the httpOnly refresh token cookie on every request
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
// Attaches the in-memory access token to every outgoing request.
// The token is read from a ref (set by AuthContext) injected via setupInterceptors().

let _getAccessToken: (() => string | null) | null = null;
let _clearAuth: (() => void) | null = null;
let _navigateToLogin: (() => void) | null = null;

/**
 * Call this once at the top of your app (inside AuthProvider) to wire the
 * interceptors to your auth state. See App.tsx for usage.
 */
export function setupInterceptors(
  getAccessToken: () => string | null,
  clearAuth: () => void,
  navigateToLogin: () => void,
) {
  _getAccessToken = getAccessToken;
  _clearAuth = clearAuth;
  _navigateToLogin = navigateToLogin;
}

// Attach token to every request
axiosInstance.interceptors.request.use((config) => {
  const token = _getAccessToken?.();
  if (token && config.headers) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// ─── Response Interceptor ─────────────────────────────────────────────────────
// On 401:
//   1. Try to silently refresh the access token (backend uses the httpOnly cookie)
//   2. Retry the original request once with the new token
//   3. If refresh fails, clear auth and redirect to /login

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
        // Call refresh directly on axiosInstance to avoid recursive interceptor loop
        const { data } = await axiosInstance.post<{ accessToken: string }>(
          "/auth/refresh",
          {},
          { _retry: true } as ExtendedConfig,
        );

        const newToken = data.accessToken;

        // Update the ref so subsequent requests use the new token
        if (_getAccessToken && originalRequest.headers) {
          originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        }

        // Notify AuthContext about the new token
        // We do this via a custom event to avoid a circular import
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

// ─── Public API ───────────────────────────────────────────────────────────────

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

## Step 5 — Status & API Hooks

### `src/hooks/useApiStatus.ts`

```ts
import { useMemo, useState } from "react";
import { capitalize } from "../helpers/capitalize";
import {
  IDLE,
  defaultApiStatuses,
  type ApiStatusValue,
} from "../constants/api-status";

const prepareStatuses = (currentStatus: ApiStatusValue) => {
  const statuses: Record<string, boolean> = {};

  for (const status of defaultApiStatuses) {
    const normalised = capitalize(status.toLowerCase());
    statuses[`is${normalised}`] = status === currentStatus;
  }

  // Returns: { isIdle, isPending, isSuccess, isError }
  return statuses as {
    isIdle: boolean;
    isPending: boolean;
    isSuccess: boolean;
    isError: boolean;
  };
};

export const useApiStatus = (initial: ApiStatusValue = IDLE) => {
  const [status, setStatus] = useState<ApiStatusValue>(initial);
  const statuses = useMemo(() => prepareStatuses(status), [status]);

  return {
    status,
    setStatus,
    ...statuses,
  };
};
```

### `src/hooks/useApi.ts`

```ts
import { useState } from "react";
import { PENDING, SUCCESS, ERROR } from "../constants/api-status";
import { useApiStatus } from "./useApiStatus";

interface UseApiConfig<T> {
  initialData?: T;
}

export function useApi<TData, TArgs extends unknown[] = []>(
  fn: (...args: TArgs) => Promise<TData>,
  config: UseApiConfig<TData> = {},
) {
  const { initialData } = config;
  const [data, setData] = useState<TData | undefined>(initialData);
  const [error, setError] = useState<unknown>(null);

  const { status, setStatus, isIdle, isPending, isSuccess, isError } =
    useApiStatus();

  const exec = async (
    ...args: TArgs
  ): Promise<{ data: TData | null; error: unknown }> => {
    try {
      setStatus(PENDING);
      const result = await fn(...args);
      setData(result);
      setStatus(SUCCESS);
      return { data: result, error: null };
    } catch (err) {
      setError(err);
      setStatus(ERROR);
      return { data: null, error: err };
    }
  };

  const reset = () => {
    setData(initialData);
    setError(null);
    setStatus("IDLE");
  };

  return {
    data,
    setData,
    error,
    status,
    setStatus,
    isIdle,
    isPending,
    isSuccess,
    isError,
    exec,
    reset,
  };
}
```

---

## Step 6 — Resource API Layers

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

// Backend reads the httpOnly refresh cookie automatically — no body needed
export const refreshToken = () =>
  api.post<AuthResponse>("/auth/refresh", {}).then((res) => res.data);

export const logout = () =>
  api.post("/auth/logout", {}).then((res) => res.data);

export const getMe = () =>
  api.get<AuthUser>("/auth/me").then((res) => res.data);
```

---

## Step 7 — Auth Hooks

### `src/features/auth/hooks/useLogin.ts`

```ts
import { useApi } from "../../../hooks/useApi";
import { login } from "../../../api/authApi";
import { useAuth } from "../../../context/AuthContext";

export function useLogin() {
  const { setAuth } = useAuth();

  const {
    exec: execLogin,
    isPending: isLoginPending,
    isError: isLoginError,
    error: loginError,
    isSuccess: isLoginSuccess,
  } = useApi(login);

  const handleLogin = async (email: string, password: string) => {
    const { data, error } = await execLogin({ email, password });

    if (data) {
      setAuth(data.user, data.accessToken);
    }

    return { data, error };
  };

  return {
    handleLogin,
    isLoginPending,
    isLoginError,
    loginError,
    isLoginSuccess,
  };
}
```

### `src/features/auth/hooks/useLogout.ts`

```ts
import { useNavigate } from "react-router-dom";
import { useApi } from "../../../hooks/useApi";
import { logout } from "../../../api/authApi";
import { useAuth } from "../../../context/AuthContext";

export function useLogout() {
  const { clearAuth } = useAuth();
  const navigate = useNavigate();

  const { exec: execLogout, isPending: isLogoutPending } = useApi(logout);

  const handleLogout = async () => {
    await execLogout();
    // clearAuth wipes the in-memory token regardless of API success
    clearAuth();
    navigate("/login", { replace: true });
  };

  return { handleLogout, isLogoutPending };
}
```

---

## Step 8 — Protected Routes

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

  // While the silent refresh is in-flight, render nothing (or a spinner)
  if (!isInitialised) {
    return <div>Loading session...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
```

---

## Step 9 — App Wiring

### `src/App.tsx`

This is where everything gets connected. The `setupInterceptors` call happens here
because we need access to both auth state and the router's `navigate`.

```tsx
import { useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { setupInterceptors } from "./api/api";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ROLES } from "./constants/roles";

// Pages (create these separately)
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import AdminPage from "./pages/AdminPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";

// Inner component so it has access to router hooks
function AppRoutes() {
  const { accessTokenRef, clearAuth } = useAuth();
  const navigate = useNavigate();

  // Wire interceptors once on mount
  useEffect(() => {
    setupInterceptors(
      () => accessTokenRef.current,
      clearAuth,
      () => navigate("/login", { replace: true }),
    );
  }, [accessTokenRef, clearAuth, navigate]);

  // Listen for token refresh events from the interceptor
  const { setAuth, user } = useAuth();
  useEffect(() => {
    const handler = (e: Event) => {
      const { accessToken } = (e as CustomEvent).detail;
      if (user) {
        setAuth(user, accessToken);
      }
    };
    window.addEventListener("auth:tokenRefreshed", handler);
    return () => window.removeEventListener("auth:tokenRefreshed", handler);
  }, [user, setAuth]);

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Protected: any authenticated user */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
      </Route>

      {/* Protected: admin only */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
        <Route path="/admin" element={<AdminPage />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
```

---

## Step 10 — Feature Hooks (Usage Examples)

These show how to build feature-level hooks using the infrastructure above.

### Example A: `src/features/users/api/usersApi.ts`

```ts
import api from "../../../api/api";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export const fetchUsers = () =>
  api.get<User[]>("/users").then((res) => res.data);

export const fetchUserById = (id: string) =>
  api.get<User>(`/users/${id}`).then((res) => res.data);

export const createUser = (payload: Omit<User, "id">) =>
  api.post<User>("/users", payload).then((res) => res.data);

export const deleteUser = (id: string) =>
  api.delete(`/users/${id}`).then((res) => res.data);
```

### Example B: `src/features/users/hooks/useFetchUsers.ts`

```ts
import { useEffect, useRef } from "react";
import { useApi } from "../../../hooks/useApi";
import { fetchUsers } from "../api/usersApi";

export function useFetchUsers(fetchOnMount = true) {
  const abortRef = useRef<(() => void) | undefined>(undefined);

  const {
    data: users,
    exec: initFetchUsers,
    isPending: isFetchUsersPending,
    isError: isFetchUsersError,
    isSuccess: isFetchUsersSuccess,
    isIdle: isFetchUsersIdle,
    error: fetchUsersError,
    reset: resetFetchUsers,
  } = useApi(() =>
    fetchUsers({
      abort: (cancel) => {
        abortRef.current = cancel;
      },
    }),
  );

  // Auto-fetch on mount with cleanup abort
  useEffect(() => {
    if (fetchOnMount) {
      initFetchUsers();
    }
    return () => {
      abortRef.current?.();
    };
  }, [fetchOnMount]);

  return {
    users: users ?? [],
    initFetchUsers,
    isFetchUsersPending,
    isFetchUsersError,
    isFetchUsersSuccess,
    isFetchUsersIdle,
    fetchUsersError,
    resetFetchUsers,
  };
}
```

### Example C: `src/features/users/hooks/useDeleteUser.ts`

```ts
import { useApi } from "../../../hooks/useApi";
import { deleteUser } from "../api/usersApi";

export function useDeleteUser() {
  const {
    exec: execDelete,
    isPending: isDeletePending,
    isError: isDeleteError,
    isSuccess: isDeleteSuccess,
    error: deleteError,
    reset: resetDelete,
  } = useApi(deleteUser);

  return {
    execDelete,
    isDeletePending,
    isDeleteError,
    isDeleteSuccess,
    deleteError,
    resetDelete,
  };
}
```

### Example D: Search with abort (abort-on-each-keystroke pattern)

```ts
// src/features/search/hooks/useSearch.ts
import { useRef } from "react";
import { useApi } from "../../../hooks/useApi";
import { didAbort } from "../../../api/api";

// replace with your actual search API call
import { searchItems } from "../api/searchApi";

export function useSearch() {
  const abortRef = useRef<(() => void) | undefined>(undefined);

  const {
    data: results,
    exec,
    isPending,
    isError,
    isSuccess,
    error,
  } = useApi((query: string) =>
    searchItems(query, {
      abort: (cancel) => {
        abortRef.current = cancel;
      },
    }),
  );

  const search = async (query: string) => {
    // Cancel any in-flight request before firing a new one
    abortRef.current?.();
    if (!query.trim()) return;
    await exec(query);
  };

  const wasAborted = didAbort(error);

  return {
    results: results ?? [],
    search,
    isPending,
    isError: isError && !wasAborted,
    isSuccess,
  };
}
```

### Example E: Using a hook in a component

```tsx
// src/features/users/components/UsersList.tsx
import { useFetchUsers } from "../hooks/useFetchUsers";

export function UsersList() {
  const {
    users,
    isFetchUsersPending,
    isFetchUsersError,
    fetchUsersError,
    initFetchUsers,
  } = useFetchUsers(true); // pass false to fetch manually

  if (isFetchUsersPending) return <p>Loading users...</p>;

  if (isFetchUsersError) {
    return (
      <div>
        <p>Failed to load users.</p>
        <button onClick={initFetchUsers}>Retry</button>
      </div>
    );
  }

  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>
          {user.name} — {user.role}
        </li>
      ))}
    </ul>
  );
}
```

### Example F: Login page

```tsx
// src/pages/LoginPage.tsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLogin } from "../features/auth/hooks/useLogin";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { handleLogin, isLoginPending, isLoginError, loginError } = useLogin();
  const navigate = useNavigate();
  const location = useLocation();
  const from =
    (location.state as { from?: Location })?.from?.pathname ?? "/dashboard";

  const onSubmit = async () => {
    const { data } = await handleLogin(email, password);
    if (data) navigate(from, { replace: true });
  };

  return (
    <div>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type="password"
        placeholder="Password"
      />
      <button onClick={onSubmit} disabled={isLoginPending}>
        {isLoginPending ? "Logging in..." : "Login"}
      </button>
      {isLoginError && <p>Login failed. Check credentials.</p>}
    </div>
  );
}
```

---

## Step 11 — Dependencies

Run this once to install all required packages:

```bash
npm install axios react-router-dom
npm install -D @types/react-router-dom
```

---

## Step 12 — Final Checklist

Verify each item before considering the implementation complete:

- [ ] `REACT_APP_API_URL` and `REACT_APP_DEBUG_API` are in `.env`
- [ ] `AuthProvider` wraps `BrowserRouter` in `App.tsx` (or `BrowserRouter` wraps `AuthProvider` with `AppRoutes` as an inner component)
- [ ] `setupInterceptors` is called inside a component that has both `useAuth()` and `useNavigate()` access
- [ ] `withCredentials: true` is set on the axios instance — the refresh cookie won't send without this
- [ ] Backend sets the refresh token as an httpOnly cookie on `/auth/login` and `/auth/refresh` responses
- [ ] Backend `/auth/logout` clears the cookie
- [ ] Access token is **never** written to `localStorage` or `sessionStorage` anywhere
- [ ] Every feature API file (like `usersApi.ts`) imports from `../api/api` (the single axios instance)
- [ ] Feature hooks clean up in-flight requests in `useEffect` cleanup via `abortRef.current?.()`

---

## File Tree Summary

```
src/
├── api/
│   ├── api.ts                  ← Axios instance, interceptors, withAbort, withLogger
│   ├── authApi.ts              ← login, logout, refreshToken, getMe
│   └── [feature]Api.ts         ← per-feature API functions
├── constants/
│   ├── api-status.ts
│   └── roles.ts
├── context/
│   └── AuthContext.tsx         ← in-memory token, silent refresh on mount
├── helpers/
│   ├── with-async.ts
│   └── capitalize.ts
├── hooks/
│   ├── useApi.ts               ← generic data + status hook
│   └── useApiStatus.ts         ← IDLE/PENDING/SUCCESS/ERROR
├── components/
│   └── ProtectedRoute.tsx      ← role-aware route guard
├── features/
│   └── [feature]/
│       ├── api/                ← resource-specific API calls
│       ├── hooks/              ← feature hooks using useApi
│       └── components/         ← UI consuming hooks
├── pages/
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── AdminPage.tsx
│   └── UnauthorizedPage.tsx
└── App.tsx                     ← route tree, interceptor wiring
```
