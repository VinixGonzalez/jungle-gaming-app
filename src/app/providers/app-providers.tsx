import type { PropsWithChildren } from "react"
import { QueryClientProvider } from "@tanstack/react-query"

import { primeInitialQueryCache } from "@/app/mocks/prime-initial-query-cache"

import { queryClient } from "./query-client"

export function AppProviders({ children }: PropsWithChildren) {
  if (import.meta.env.VITE_ENABLE_MSW !== "false") {
    primeInitialQueryCache()
  }

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
