import { useCallback, useState } from "react"

import { getApiError } from "@/shared/api"
import { useSingleFlight } from "@/shared/hooks"

import type { AddCartItemInput } from "../api/cart.schemas"
import type { CartFeedback } from "../model/cart-feedback"
import { useAddCartItemMutation } from "./use-add-cart-item-mutation"
import { useCartQuery } from "./use-cart-query"

export function useAddToCart() {
  const cartQuery = useCartQuery()
  const addCartItem = useAddCartItemMutation()
  const runSingleFlight = useSingleFlight()
  const [feedback, setFeedback] = useState<CartFeedback | null>(null)
  const mutateCartItem = addCartItem.mutateAsync

  const add = useCallback(async (input: AddCartItemInput) => {
    const result = await runSingleFlight(async () => {
      setFeedback(null)

      try {
        await mutateCartItem(input)
        setFeedback({
          kind: "status",
          message: `${input.quantity} ${input.quantity === 1 ? "item adicionado" : "itens adicionados"} ao carrinho.`,
        })
        return true
      } catch (error) {
        const apiError = getApiError(error)
        const message =
          apiError?.code === "CART_ITEM_AVAILABILITY_CONFLICT"
            ? "A quantidade somada ao carrinho excede o estoque disponível."
            : "Não foi possível adicionar ao carrinho. Tente novamente."

        setFeedback({ kind: "error", message })
        return false
      }
    })

    return result ?? false
  }, [mutateCartItem, runSingleFlight])

  return {
    add,
    cartCount: cartQuery.data?.totals.itemCount ?? 0,
    feedback,
    isPending: addCartItem.isPending || cartQuery.isPending,
  }
}
