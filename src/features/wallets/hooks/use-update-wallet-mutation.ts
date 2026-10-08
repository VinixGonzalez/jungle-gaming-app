import { useMutation, useQueryClient } from "@tanstack/react-query"

import { identityMutationScope } from "@/shared/query"

import { walletsApi } from "../api/wallet.api"
import type { UpdateWalletInput } from "../api/wallet.schemas"
import { walletsQueryKeys } from "../query/wallets-query-keys"

interface UpdateWalletVariables {
  input: UpdateWalletInput
  walletId: string
}

export function useUpdateWalletMutation(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [...walletsQueryKeys.byOwner(userId), "update"],
    mutationFn: ({ input, walletId }: UpdateWalletVariables) =>
      walletsApi.update(walletId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: walletsQueryKeys.byOwner(userId),
      })
    },
    scope: identityMutationScope,
  })
}
