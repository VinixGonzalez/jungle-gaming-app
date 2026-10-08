import type { QueryClient } from "@tanstack/react-query"

import { authSessionQueryOptions } from "./auth-session-query-options"
import { getSafeReturnTo } from "../model/get-safe-return-to"

export async function getUnauthenticatedRedirect(
  queryClient: QueryClient,
  returnTo?: string,
) {
  const session = await queryClient.fetchQuery({
    ...authSessionQueryOptions,
    staleTime: 0,
  })

  if (session) return null

  const search = new URLSearchParams({ returnTo: getSafeReturnTo(returnTo) })

  return `/login?${search.toString()}`
}
