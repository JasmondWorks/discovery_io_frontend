import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchCurrentUser,
  fetchAllUsers,
  fetchUserById,
  createUser,
  updateUser,
  deleteUser,
  updateProfessionalProfile,
} from "../api/usersApi";

// ─── Queries ─────────────────────────────────────────────────────────────────

export function useCurrentUser() {
  return useQuery({
    queryKey: ["user", "me"],
    queryFn: fetchCurrentUser,
  });
}

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: fetchAllUsers,
  });
}

export function useUser(id?: string) {
  return useQuery({
    queryKey: ["users", id],
    queryFn: () => fetchUserById(id!),
    enabled: !!id,
  });
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Parameters<typeof updateUser>[1];
    }) => updateUser(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users", id] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useUpdateProfessionalProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfessionalProfile,
    onSuccess: () => {
      // Invalidate the current user to fetch the updated profile data
      queryClient.invalidateQueries({ queryKey: ["user", "me"] });
    },
  });
}
