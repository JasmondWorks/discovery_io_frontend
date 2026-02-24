/**
 * useAuth.ts
 *
 * React hook + context that:
 *  1. On mount, calls isAuthenticated() to check the HTTP-only cookie
 *  2. Exposes { user, loading, authenticated } to the component tree
 *  3. Provides login / logout / register actions
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  isAuthenticated,
  getCurrentUser,
  login as apiLogin,
  logout as apiLogout,
  register as apiRegister,
  type AuthUser,
} from "@/utils/auth";

// ─── Types ───────────────────────────────────────────────────────────────────

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  authenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refetch: () => Promise<void>;
}

// ─── Context ─────────────────────────────────────────────────────────────────

import { createContext as _createContext } from "react";

const AuthContext = createContext<AuthContextValue | null>(null);

export { AuthContext };

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within <AuthProvider>");
  }
  return ctx;
}

// ─── Provider ────────────────────────────────────────────────────────────────

import { type ReactNode } from "react";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    authenticated: false,
  });

  const fetchAuthState = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }));
    try {
      const ok = await isAuthenticated();
      if (ok) {
        const user = await getCurrentUser();
        setState({ user, loading: false, authenticated: true });
      } else {
        setState({ user: null, loading: false, authenticated: false });
      }
    } catch {
      setState({ user: null, loading: false, authenticated: false });
    }
  }, []);

  // Check auth on mount (app start)
  useEffect(() => {
    fetchAuthState();
  }, [fetchAuthState]);

  const login = useCallback(
    async (email: string, password: string) => {
      await apiLogin(email, password);
      await fetchAuthState(); // refresh user state after login
    },
    [fetchAuthState],
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      await apiRegister(name, email, password);
      await fetchAuthState();
    },
    [fetchAuthState],
  );

  const logout = useCallback(async () => {
    await apiLogout();
    setState({ user: null, loading: false, authenticated: false });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        refetch: fetchAuthState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
