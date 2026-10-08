import { useMutation, useQueryClient } from "@tanstack/react-query"

import { authApi } from "../api/auth.api"
import type { LoginInput } from "../api/auth.schemas"
import { authSessionCache } from "../query/auth-session-cache"
import { authSessionQueryKey } from "../query/auth-session-query-key"

export function useLoginMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [...authSessionQueryKey, "login"],
    mutationFn: (input: LoginInput) => authApi.login(input),
    onMutate: () => authSessionCache.cancel(queryClient),
    onSuccess: (session) => authSessionCache.replace(queryClient, session),
    gcTime: 0,
    scope: authSessionCache.mutationScope,
  })
}
