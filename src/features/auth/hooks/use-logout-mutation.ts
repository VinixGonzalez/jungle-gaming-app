import { useMutation, useQueryClient } from "@tanstack/react-query"

import { authApi } from "../api/auth.api"
import { authSessionCache } from "../query/auth-session-cache"
import { authSessionQueryKey } from "../query/auth-session-query-key"

export function useLogoutMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [...authSessionQueryKey, "logout"],
    mutationFn: authApi.logout,
    onMutate: () => authSessionCache.cancel(queryClient),
    onSuccess: () => authSessionCache.replace(queryClient, null),
    scope: authSessionCache.mutationScope,
  })
}
