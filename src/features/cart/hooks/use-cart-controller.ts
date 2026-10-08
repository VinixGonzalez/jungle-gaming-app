import { useState } from "react"

import { useLatestNftUpdate } from "@/features/catalog"
import { getApiError } from "@/shared/api"

import type { ApplyCartCouponInput } from "../api/cart.schemas"
import type { CartFeedback } from "../model/cart-feedback"
import { useApplyCartCouponMutation } from "./use-apply-cart-coupon-mutation"
import { useCartQuery } from "./use-cart-query"
import { useRemoveCartCouponMutation } from "./use-remove-cart-coupon-mutation"
import { useRemoveCartItemMutation } from "./use-remove-cart-item-mutation"
import { useUpdateCartItemQuantityMutation } from "./use-update-cart-item-quantity-mutation"

function getMutationErrorMessage(error: unknown) {
  const apiError = getApiError(error)

  if (apiError?.code === "CART_ITEM_AVAILABILITY_CONFLICT") {
    return "O estoque desta edição mudou. Revise a quantidade disponível."
  }

  return "Não foi possível atualizar o carrinho. Tente novamente."
}

export function useCartController() {
  const cartQuery = useCartQuery()
  const latestNftUpdate = useLatestNftUpdate()
  const updateItem = useUpdateCartItemQuantityMutation()
  const removeItem = useRemoveCartItemMutation()
  const applyCoupon = useApplyCartCouponMutation()
  const removeCoupon = useRemoveCartCouponMutation()
  const [feedback, setFeedback] = useState<CartFeedback | null>(null)

  async function changeQuantity(itemId: string, quantity: number) {
    setFeedback(null)

    try {
      const cart = await updateItem.mutateAsync({ itemId, quantity })
      const item = cart.items.find((candidate) => candidate.id === itemId)
      setFeedback({
        kind: "status",
        message: item
          ? `Quantidade de ${item.product.name} atualizada para ${item.quantity}.`
          : "Quantidade atualizada.",
      })
    } catch (error) {
      setFeedback({ kind: "error", message: getMutationErrorMessage(error) })

      if (getApiError(error)?.code === "CART_ITEM_AVAILABILITY_CONFLICT") {
        void cartQuery.refetch()
      }
    }
  }

  async function removeFromCart(itemId: string) {
    const itemName = cartQuery.data?.items.find((item) => item.id === itemId)
      ?.product.name
    setFeedback(null)

    try {
      await removeItem.mutateAsync(itemId)
      setFeedback({
        kind: "status",
        message: itemName
          ? `${itemName} foi removido do carrinho.`
          : "Item removido do carrinho.",
      })
    } catch (error) {
      setFeedback({ kind: "error", message: getMutationErrorMessage(error) })
    }
  }

  async function applyCartCoupon(input: ApplyCartCouponInput) {
    await applyCoupon.mutateAsync(input)
  }

  async function removeCartCoupon() {
    await removeCoupon.mutateAsync()
  }

  const pendingItemId = updateItem.isPending
    ? updateItem.variables?.itemId
    : removeItem.isPending
      ? removeItem.variables
      : undefined
  const isUpdating =
    updateItem.isPending ||
    removeItem.isPending ||
    applyCoupon.isPending ||
    removeCoupon.isPending ||
    cartQuery.isFetching
  const affectedCartItem = cartQuery.data?.items.find(
    (item) => item.product.id === latestNftUpdate?.resourceId,
  )
  const realtimeFeedback: CartFeedback | null = affectedCartItem
    ? {
        kind: "status",
        message: `Preço e disponibilidade de ${affectedCartItem.product.name} foram atualizados em tempo real.`,
      }
    : null
  const common = {
    applyCoupon: applyCartCoupon,
    cartCount: cartQuery.data?.totals.itemCount ?? 0,
    changeQuantity: (itemId: string, quantity: number) => {
      void changeQuantity(itemId, quantity)
    },
    feedback: feedback ?? realtimeFeedback,
    isUpdating,
    pendingItemId,
    removeCoupon: removeCartCoupon,
    removeItem: (itemId: string) => {
      void removeFromCart(itemId)
    },
    retry: () => {
      void cartQuery.retry()
    },
  }

  if (cartQuery.identityError) {
    return { ...common, cart: undefined, status: "error" as const }
  }

  if (cartQuery.isPending || (cartQuery.isFetching && !cartQuery.data)) {
    return { ...common, cart: undefined, status: "loading" as const }
  }

  if (!cartQuery.data) {
    return { ...common, cart: undefined, status: "error" as const }
  }

  if (cartQuery.data.items.length === 0) {
    return { ...common, cart: cartQuery.data, status: "empty" as const }
  }

  return { ...common, cart: cartQuery.data, status: "ready" as const }
}
