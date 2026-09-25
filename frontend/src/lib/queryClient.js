import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes fresh
      gcTime: 1000 * 60 * 60 * 24, // 24 hours retention for offline/cached browsing
      retry: (failureCount, error) => {
        // Don't retry on 4xx client errors (e.g. 401, 403, 404)
        if (error?.response?.status && error.response.status < 500) {
          return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false, // Save bandwidth on mobile connections
      refetchOnReconnect: true,
    },
    mutations: {
      retry: false,
    },
  },
});
