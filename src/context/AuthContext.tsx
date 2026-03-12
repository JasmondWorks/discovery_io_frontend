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
  professionalProfile?: any;
  onboardingCompleted?: boolean;
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

    // Manually clear any non-httpOnly cookies that might be lingering
    document.cookie =
      "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie =
      "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie =
      "connect.sid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
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
