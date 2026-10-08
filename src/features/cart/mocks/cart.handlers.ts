import { createCartCouponHandlers } from "./cart-coupon.handlers"
import { createCartItemHandlers } from "./cart-item.handlers"

interface CartHandlerDependencies {
  getAuthenticatedUserId: () => string | null
}

export function createCartHandlers(dependencies: CartHandlerDependencies) {
  return [
    ...createCartItemHandlers(dependencies),
    ...createCartCouponHandlers(dependencies),
  ]
}
