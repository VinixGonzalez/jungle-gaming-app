import type { QueryClient } from "@tanstack/react-query"

import type { NftUpdatedEvent } from "@/features/catalog"
import { formatWeiToEth, parseEthToWei } from "@/shared/utils"

import type { CartResponse } from "../api/cart.schemas"
import { calculateCartTotals } from "../model/calculate-cart-totals"
import { cartQueryKeys } from "../query/cart-query-keys"

function updateCart(
  cart: CartResponse | undefined,
  event: NftUpdatedEvent,
) {
  if (!cart) return cart

  const items = cart.items.flatMap((cartItem) => {
    if (cartItem.product.id !== event.resourceId) return [cartItem]

    const edition = event.editions.find(
      (candidate) => candidate.id === cartItem.edition.id,
    )

    if (!edition || edition.availableQuantity === 0) return []

    const quantity = Math.min(cartItem.quantity, edition.availableQuantity)

    return [{
      ...cartItem,
      edition,
      lineTotalEth: formatWeiToEth(
        parseEthToWei(edition.priceEth) * BigInt(quantity),
      ),
      product: event.item,
      quantity,
    }]
  })

  return {
    ...cart,
    items,
    recommendedItems: cart.recommendedItems.map((item) =>
      item.id === event.resourceId ? event.item : item,
    ),
    totals: calculateCartTotals(items, cart.coupon),
  }
}

export const cartRealtimeCache = {
  apply(
    queryClient: QueryClient,
    ownerId: string,
    event: NftUpdatedEvent,
  ) {
    queryClient.setQueryData<CartResponse>(
      cartQueryKeys.byOwner(ownerId),
      (cart) => updateCart(cart, event),
    )
  },
}
