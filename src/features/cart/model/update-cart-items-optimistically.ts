import type { CartItem, CartResponse } from "../api/cart.schemas"

export function updateCartItemsOptimistically(
  cart: CartResponse,
  items: CartItem[],
): CartResponse {
  return {
    ...cart,
    items,
    totals: {
      ...cart.totals,
      itemCount: items.reduce((total, item) => total + item.quantity, 0),
    },
  }
}
