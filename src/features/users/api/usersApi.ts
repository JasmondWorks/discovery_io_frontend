import api from "../../../api/api";
import type { RegisterPayload } from "../../../api/authApi";
import type { User, ProfessionalProfile } from "../../../api/types";

export const fetchCurrentUser = () =>
  api.get<User>("/user/me").then((res) => res.data);

export const fetchAllUsers = () =>
  api.get<User[]>("/user").then((res) => res.data);

export const fetchUserById = (id: string) =>
  api.get<User>(`/user/${id}`).then((res) => res.data);

// Only Super Admins
export const createUser = (payload: RegisterPayload & { role?: string }) =>
  api.post<User>("/user", payload).then((res) => res.data);

// Only Super Admins
export const updateUser = (id: string, payload: Partial<User>) =>
  api.patch<User>(`/user/${id}`, payload).then((res) => res.data);

// Only Super Admins
export const deleteUser = (id: string) =>
  api.delete(`/user/${id}`).then((res) => res.data);

export const updateProfessionalProfile = (
  professionalProfile: ProfessionalProfile,
) =>
  api
    .patch<User>("/user/me/professional-profile", { professionalProfile })
    .then((res) => res.data);
