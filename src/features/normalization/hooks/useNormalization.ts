import { useMutation } from "@tanstack/react-query";
import { normalizeData, normalizeProfession } from "../api/normalizationApi";

export function useNormalizeData() {
  const mutation = useMutation({
    mutationFn: normalizeData,
  });

  return {
    normalize: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    data: mutation.data,
  };
}

export function useNormalizeProfession() {
  const mutation = useMutation({
    mutationFn: normalizeProfession,
  });

  return {
    normalize: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    data: mutation.data,
  };
}
