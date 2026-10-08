import { useMutation, useQueryClient } from "@tanstack/react-query"

import { cartApi } from "../api/cart.api"
import type {
  CartResponse,
  UpdateCartItemInput,
} from "../api/cart.schemas"
import { updateCartItemsOptimistically } from "../model/update-cart-items-optimistically"
import { cartMutationCache } from "../query/cart-mutation-cache"
import { useCartCacheScope } from "./use-cart-cache-scope"

interface CartMutationContext {
  previousCart?: CartResponse
  queryKey: readonly unknown[]
}

export function useUpdateCartItemQuantityMutation() {
  const queryClient = useQueryClient()
  const cartCache = useCartCacheScope()

  return useMutation<
    CartResponse,
    Error,
    UpdateCartItemInput,
    CartMutationContext
  >({
    mutationKey: [...cartCache.queryKey, "update-item"],
    mutationFn: cartApi.updateItemQuantity,
    onMutate: async ({ itemId, quantity }) => {
      await cartMutationCache.cancel(queryClient, cartCache.queryKey)
      const previousCart = queryClient.getQueryData<CartResponse>(
        cartCache.queryKey,
      )

      if (previousCart) {
        const items = previousCart.items.map((item) =>
          item.id === itemId ? { ...item, quantity } : item,
        )

        queryClient.setQueryData(
          cartCache.queryKey,
          updateCartItemsOptimistically(previousCart, items),
        )
      }

      return { previousCart, queryKey: cartCache.queryKey }
    },
    onError: (_error, _input, context) => {
      cartMutationCache.restore(
        queryClient,
        context?.queryKey ?? cartCache.queryKey,
        context?.previousCart,
      )
    },
    onSuccess: (cart, _input, context) =>
      cartMutationCache.write(queryClient, context.queryKey, cart),
    scope: cartMutationCache.scope,
  })
}
