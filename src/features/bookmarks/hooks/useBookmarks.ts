import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchBookmarks,
  createBookmark,
  deleteBookmark,
} from "../api/bookmarksApi";
import toast from "react-hot-toast";

export function useBookmarks(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["bookmarks", params],
    queryFn: () => fetchBookmarks(params),
  });
}

export function useCreateBookmark() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBookmark,
    onMutate: async (payload) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ["bookmarks"] });

      // Snapshot the previous value
      const previousBookmarks = queryClient.getQueryData(["bookmarks"]);

      // Optimistically update to the new value
      queryClient.setQueryData(["bookmarks"], (old: any) => {
        const bookmarks = Array.isArray(old) ? old : old?.data || [];
        const newBookmark =
          typeof payload === "string"
            ? { id: `temp-${Date.now()}`, tool_id: payload } // Path-based
            : { id: `temp-${Date.now()}`, ...payload }; // Body-based

        if (Array.isArray(old)) return [...bookmarks, newBookmark];
        return { ...old, data: [...bookmarks, newBookmark] };
      });

      // Return a context object with the snapshotted value
      return { previousBookmarks };
    },
    onError: (error: any, _payload, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousBookmarks) {
        queryClient.setQueryData(["bookmarks"], context.previousBookmarks);
      }

      const message = error.response?.data?.message || error.message;
      if (message === "You have already bookmarked this tool.") {
        toast.error("Already in bookmarks");
      } else {
        toast.error("Failed to save bookmark");
      }
    },
    onSuccess: () => {
      toast.success("Saved to bookmarks");
    },
    onSettled: () => {
      // Always refetch after error or success to guarantee we are in sync with the server
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    },
  });
}

export function useDeleteBookmark() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBookmark,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["bookmarks"] });
      const previousBookmarks = queryClient.getQueryData(["bookmarks"]);

      queryClient.setQueryData(["bookmarks"], (old: any) => {
        const bookmarks = Array.isArray(old) ? old : old?.data || [];
        const filtered = bookmarks.filter((b: any) => b.id !== id);

        if (Array.isArray(old)) return filtered;
        return { ...old, data: filtered };
      });

      return { previousBookmarks };
    },
    onError: (_error, _id, context) => {
      if (context?.previousBookmarks) {
        queryClient.setQueryData(["bookmarks"], context.previousBookmarks);
      }
      toast.error("Failed to remove bookmark");
    },
    onSuccess: () => {
      toast.success("Removed from bookmarks");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    },
  });
}
