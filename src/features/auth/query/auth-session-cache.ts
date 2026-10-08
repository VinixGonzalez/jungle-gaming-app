import type { QueryClient } from "@tanstack/react-query"

import { identityMutationScope, identityQueryCache } from "@/shared/query"

import type { AuthSession } from "../api/auth.schemas"
import { authSessionQueryKey } from "./auth-session-query-key"

function cancelSessionQuery(queryClient: QueryClient) {
  return queryClient.cancelQueries({
    exact: true,
    queryKey: authSessionQueryKey,
  })
}

export const authSessionCache = {
  mutationScope: identityMutationScope,
  cancel: cancelSessionQuery,

  async replace(queryClient: QueryClient, session: AuthSession | null) {
    await cancelSessionQuery(queryClient)
    await identityQueryCache.clear(queryClient)
    queryClient.setQueryData(authSessionQueryKey, session)
  },
}
