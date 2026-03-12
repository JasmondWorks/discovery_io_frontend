import { useMutation } from "@tanstack/react-query";
import { uploadMedia } from "../api/mediaApi";

export function useUploadMedia() {
  const mutation = useMutation({
    mutationFn: uploadMedia,
  });

  return {
    upload: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    data: mutation.data,
  };
}
