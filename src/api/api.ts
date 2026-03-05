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

const withAbort = <T>(fn: (...args: any[]) => Promise<T>) => {
  return async (...args: any[]): Promise<T> => {
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
        const [url, body] = args as [string, any];
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
    if (import.meta.env.VITE_DEBUG_API !== "true") throw error;

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
  baseURL: import.meta.env.VITE_API_URL,
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
