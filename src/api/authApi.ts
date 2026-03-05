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
