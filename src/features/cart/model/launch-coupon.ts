import type { CartCoupon } from "../api/cart.schemas"

export const launchCoupon = {
  code: "LAUNCH10",
  discountPercentage: 10,
} as const satisfies CartCoupon
