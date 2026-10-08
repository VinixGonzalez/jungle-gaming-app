import { useMutation, useQueryClient } from "@tanstack/react-query"

import { cartApi } from "../api/cart.api"
import type { ApplyCartCouponInput } from "../api/cart.schemas"
import { cartMutationCache } from "../query/cart-mutation-cache"
import { useCartCacheScope } from "./use-cart-cache-scope"

export function useApplyCartCouponMutation() {
  const queryClient = useQueryClient()
  const cartCache = useCartCacheScope()

  return useMutation({
    mutationKey: [...cartCache.queryKey, "apply-coupon"],
    mutationFn: (input: ApplyCartCouponInput) => cartApi.applyCoupon(input),
    onMutate: async () => {
      await cartMutationCache.cancel(queryClient, cartCache.queryKey)

      return { queryKey: cartCache.queryKey }
    },
    onSuccess: (cart, _input, context) =>
      cartMutationCache.write(queryClient, context.queryKey, cart),
    scope: cartMutationCache.scope,
  })
}
