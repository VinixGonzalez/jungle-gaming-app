import { useMutation, useQueryClient } from "@tanstack/react-query"

import { identityMutationScope, identityQueryCache } from "@/shared/query"
import { walletsQueryKeys } from "@/features/wallets"

import { accountApi } from "../api/account.api"
import { profileQueryCache } from "../query/profile-query-cache"

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [...identityQueryCache.rootKey, "account", "profile"],
    mutationFn: accountApi.updateProfile,
    onMutate: () => profileQueryCache.cancel(queryClient),
    onSuccess: async (profile) => {
      profileQueryCache.replace(queryClient, profile)
      await queryClient.invalidateQueries({
        queryKey: walletsQueryKeys.byOwner(profile.id),
      })
    },
    scope: identityMutationScope,
  })
}
