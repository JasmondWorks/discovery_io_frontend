/**
 * auth.ts
 *
 * isAuthenticated() — the single source of truth for whether the current
 * browser session holds a valid access token.
 *
 * Because the token is stored in an HTTP-only cookie (not readable by JS),
 * we hit GET /auth/me and trust the server to validate it.
 *
 * Returns `true`  → the cookie is present and the server accepted it.
 * Returns `false` → no cookie, expired cookie, or server rejected it.
 */

import { api, ApiError } from "@/lib/apiClient";

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface MeResponse {
  data: {
    user: AuthUser;
  };
}

/**
 * Checks whether the access-token cookie is present *and* valid by asking
 * the server.  The cookie is HTTP-only so JavaScript cannot inspect it
 * directly — this server round-trip is the correct approach.
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    await api.get<MeResponse>("/auth/me");
    return true;
  } catch (err) {
    if (err instanceof ApiError && err.statusCode === 401) {
      return false;
    }
    // Network errors etc. → treat as unauthenticated to be safe
    return false;
  }
}

/**
 * Fetches the current user.  Returns null when not authenticated.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const res = await api.get<MeResponse>("/auth/me");
    return res.data.user;
  } catch {
    return null;
  }
}

export async function login(email: string, password: string) {
  return api.post("/auth/login", { email, password });
}

export async function register(name: string, email: string, password: string) {
  return api.post("/auth/register", { name, email, password });
}

export async function logout() {
  return api.post("/auth/logout");
}
