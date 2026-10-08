import type { QueryClient } from "@tanstack/react-query"

import { authSessionQueryOptions } from "./auth-session-query-options"
import { getSafeReturnTo } from "../model/get-safe-return-to"

export async function getAuthenticatedRedirect(
  queryClient: QueryClient,
  returnTo?: string,
) {
  const session = await queryClient.fetchQuery({
    ...authSessionQueryOptions,
    staleTime: 0,
  })

  return session ? getSafeReturnTo(returnTo) : null
}
