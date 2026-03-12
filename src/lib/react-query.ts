import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Only retry once by default on failure
      refetchOnWindowFocus: false, // Turn off refetching on window focus, can be overridden per query
      staleTime: 5 * 60 * 1000, // 5 minutes before data is considered stale
    },
  },
});
