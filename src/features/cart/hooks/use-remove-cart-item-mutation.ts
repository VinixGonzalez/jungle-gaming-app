import { useMutation, useQueryClient } from "@tanstack/react-query"

import { cartApi } from "../api/cart.api"
import type { CartResponse } from "../api/cart.schemas"
import { updateCartItemsOptimistically } from "../model/update-cart-items-optimistically"
import { cartMutationCache } from "../query/cart-mutation-cache"
import { useCartCacheScope } from "./use-cart-cache-scope"

interface CartMutationContext {
  previousCart?: CartResponse
  queryKey: readonly unknown[]
}

export function useRemoveCartItemMutation() {
  const queryClient = useQueryClient()
  const cartCache = useCartCacheScope()

  return useMutation<CartResponse, Error, string, CartMutationContext>({
    mutationKey: [...cartCache.queryKey, "remove-item"],
    mutationFn: cartApi.removeItem,
    onMutate: async (itemId) => {
      await cartMutationCache.cancel(queryClient, cartCache.queryKey)
      const previousCart = queryClient.getQueryData<CartResponse>(
        cartCache.queryKey,
      )

      if (previousCart) {
        queryClient.setQueryData(
          cartCache.queryKey,
          updateCartItemsOptimistically(
            previousCart,
            previousCart.items.filter((item) => item.id !== itemId),
          ),
        )
      }

      return { previousCart, queryKey: cartCache.queryKey }
    },
    onError: (_error, _itemId, context) => {
      cartMutationCache.restore(
        queryClient,
        context?.queryKey ?? cartCache.queryKey,
        context?.previousCart,
      )
    },
    onSuccess: (cart, _itemId, context) =>
      cartMutationCache.write(queryClient, context.queryKey, cart),
    scope: cartMutationCache.scope,
  })
}
