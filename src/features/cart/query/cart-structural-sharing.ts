import { formatWeiToEth, parseEthToWei } from "@/shared/utils"

import type { CartItem, CartResponse } from "../api/cart.schemas"
import { calculateCartTotals } from "../model/calculate-cart-totals"

function keepNewerCartItem(
  current: CartItem | undefined,
  next: CartItem,
) {
  if (!current || current.product.version <= next.product.version) return next

  return {
    ...next,
    edition: current.edition,
    lineTotalEth: formatWeiToEth(
      parseEthToWei(current.edition.priceEth) * BigInt(next.quantity),
    ),
    product: current.product,
  }
}

export function shareCartResponse(
  currentData: unknown,
  nextData: unknown,
): CartResponse {
  const current = currentData as CartResponse | undefined
  const next = nextData as CartResponse

  if (!current) return next

  const currentItems = new Map(
    current.items.map((item) => [item.id, item]),
  )
  const currentRecommendations = new Map(
    current.recommendedItems.map((item) => [item.id, item]),
  )
  const items = next.items.map((item) =>
    keepNewerCartItem(currentItems.get(item.id), item),
  )

  return {
    ...next,
    items,
    recommendedItems: next.recommendedItems.map((item) => {
      const currentItem = currentRecommendations.get(item.id)

      return currentItem && currentItem.version > item.version
        ? currentItem
        : item
    }),
    totals: calculateCartTotals(items, next.coupon),
  }
}
