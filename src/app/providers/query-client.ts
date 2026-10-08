import { QueryClient } from "@tanstack/react-query"

import { isHttpClientError } from "@/shared/api"

function shouldRetryQuery(failureCount: number, error: Error) {
  if (error.name === "ZodError") return false

  if (
    isHttpClientError(error) &&
    typeof error.response?.status === "number" &&
    error.response.status < 500
  ) {
    return false
  }

  return failureCount < 1
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: shouldRetryQuery,
      staleTime: 30_000,
    },
  },
})
