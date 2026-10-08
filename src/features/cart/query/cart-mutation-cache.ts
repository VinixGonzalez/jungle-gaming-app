import type { QueryClient } from "@tanstack/react-query"

import { identityMutationScope } from "@/shared/query"

import type { CartResponse } from "../api/cart.schemas"

export const cartMutationCache = {
  scope: identityMutationScope,
  cancel(queryClient: QueryClient, queryKey: readonly unknown[]) {
    return queryClient.cancelQueries({ queryKey })
  },
  write(
    queryClient: QueryClient,
    queryKey: readonly unknown[],
    cart: CartResponse,
  ) {
    if (queryClient.getQueryState(queryKey)) {
      queryClient.setQueryData(queryKey, cart)
    }
  },
  restore(
    queryClient: QueryClient,
    queryKey: readonly unknown[],
    previousCart: CartResponse | undefined,
  ) {
    if (previousCart) {
      cartMutationCache.write(queryClient, queryKey, previousCart)
    }
  },
}
