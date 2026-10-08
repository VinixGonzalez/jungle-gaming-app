import { useMutation, useQueryClient } from "@tanstack/react-query"

import {
  walletsApi,
  walletsQueryKeys,
  type WalletsResponse,
} from "@/features/wallets"
import {
  identityMutationScope,
  identityQueryCache,
} from "@/shared/query"

import { checkoutApi } from "../api/checkout.api"
import type { CheckoutOrderCreator } from "../contracts"

interface UseCheckoutMutationsOptions {
  createOrder: CheckoutOrderCreator
  userId: string | undefined
}

export function useCheckoutMutations({
  createOrder,
  userId,
}: UseCheckoutMutationsOptions) {
  const queryClient = useQueryClient()
  const walletsQueryKey = walletsQueryKeys.byOwner(userId ?? "anonymous")
  const connect = useMutation({
    mutationKey: [...identityQueryCache.rootKey, "checkout", "connect-wallet"],
    mutationFn: walletsApi.connect,
    onMutate: () => queryClient.cancelQueries({ queryKey: walletsQueryKey }),
    scope: identityMutationScope,
    onSuccess: (nextConnection) => {
      queryClient.setQueryData<WalletsResponse>(walletsQueryKey, (current) =>
        current ? { ...current, connection: nextConnection } : current,
      )
    },
  })
  const disconnect = useMutation({
    mutationKey: [
      ...identityQueryCache.rootKey,
      "checkout",
      "disconnect-wallet",
    ],
    mutationFn: walletsApi.disconnect,
    onMutate: () => queryClient.cancelQueries({ queryKey: walletsQueryKey }),
    scope: identityMutationScope,
    onSuccess: () => {
      queryClient.setQueryData<WalletsResponse>(walletsQueryKey, (current) =>
        current ? { ...current, connection: null } : current,
      )
    },
  })
  const quote = useMutation({
    mutationKey: [...identityQueryCache.rootKey, "checkout", "quote"],
    mutationFn: checkoutApi.createQuote,
    scope: identityMutationScope,
  })
  const order = useMutation({
    mutationKey: [...identityQueryCache.rootKey, "checkout", "order"],
    mutationFn: createOrder,
    scope: identityMutationScope,
  })

  return { connect, disconnect, order, quote }
}
