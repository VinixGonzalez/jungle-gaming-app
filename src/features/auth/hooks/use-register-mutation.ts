import { useMutation, useQueryClient } from "@tanstack/react-query"

import { authApi } from "../api/auth.api"
import type { RegisterInput } from "../api/auth.schemas"
import { authSessionCache } from "../query/auth-session-cache"
import { authSessionQueryKey } from "../query/auth-session-query-key"

export function useRegisterMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [...authSessionQueryKey, "register"],
    mutationFn: (input: RegisterInput) => authApi.register(input),
    onMutate: () => authSessionCache.cancel(queryClient),
    onSuccess: (session) => authSessionCache.replace(queryClient, session),
    gcTime: 0,
    scope: authSessionCache.mutationScope,
  })
}
