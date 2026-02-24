/**
 * apiClient.ts
 *
 * A thin fetch wrapper that:
 *  - always includes `credentials: "include"` so HTTP-only cookies are sent
 *  - on a 401 response, automatically tries to refresh the access token once
 *    and retries the original request
 *  - rejects with a typed ApiError on failure
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api/v1";

export class ApiError extends Error {
  readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
  }
}

type RequestOptions = Omit<RequestInit, "credentials">;

async function refreshTokens(): Promise<void> {
  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) {
    throw new ApiError(res.status, "Session expired. Please log in again.");
  }
}

export async function apiRequest<T = unknown>(
  path: string,
  options: RequestOptions = {},
  retry = true,
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  if (res.status === 401 && retry) {
    // Attempt a silent token refresh, then retry once
    try {
      await refreshTokens();
      return apiRequest<T>(path, options, false);
    } catch {
      throw new ApiError(401, "Session expired. Please log in again.");
    }
  }

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(
      res.status,
      (json as { message?: string }).message ?? "Request failed",
    );
  }

  return json as T;
}

// ─── Convenience helpers ────────────────────────────────────────────────────

export const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: "GET" }),

  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(path, {
      ...options,
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(path, {
      ...options,
      method: "PATCH",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(path: string, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: "DELETE" }),
};
