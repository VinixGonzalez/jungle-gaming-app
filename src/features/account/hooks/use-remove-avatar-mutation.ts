import { useMutation, useQueryClient } from "@tanstack/react-query"

import { identityMutationScope, identityQueryCache } from "@/shared/query"

import { accountApi } from "../api/account.api"
import { profileQueryCache } from "../query/profile-query-cache"

export function useRemoveAvatarMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [...identityQueryCache.rootKey, "account", "avatar", "remove"],
    mutationFn: accountApi.removeAvatar,
    onMutate: () => profileQueryCache.cancel(queryClient),
    onSuccess: (profile) => profileQueryCache.replace(queryClient, profile),
    scope: identityMutationScope,
  })
}
