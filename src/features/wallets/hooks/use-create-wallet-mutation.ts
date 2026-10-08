import { useMutation, useQueryClient } from "@tanstack/react-query"

import { identityMutationScope } from "@/shared/query"

import { walletsApi } from "../api/wallet.api"
import { walletsQueryKeys } from "../query/wallets-query-keys"

export function useCreateWalletMutation(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [...walletsQueryKeys.byOwner(userId), "create"],
    mutationFn: walletsApi.create,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: walletsQueryKeys.byOwner(userId),
      })
    },
    scope: identityMutationScope,
  })
}
