import { http, HttpResponse } from "msw"

import { applyCartCouponInputSchema } from "../api/cart.schemas"
import { launchCoupon } from "../model/launch-coupon"
import { cartMockService } from "./cart-mock.service"

type StoredCart = ReturnType<typeof cartMockService.readCart>

interface CartCouponHandlerDependencies {
  getAuthenticatedUserId: () => string | null
}

export function createCartCouponHandlers({
  getAuthenticatedUserId,
}: CartCouponHandlerDependencies) {
  return [
    http.post("/api/cart/coupon", async ({ cookies, request }) => {
      const userId = getAuthenticatedUserId()
      const scenarioResponse =
        await cartMockService.resolveScenarioResponse(cookies)

      if (scenarioResponse) return scenarioResponse

      const inputResult = applyCartCouponInputSchema.safeParse(
        await cartMockService.readRequestBody(request),
      )

      if (!inputResult.success) {
        return cartMockService.createInvalidBodyResponse(
          inputResult.error.issues,
        )
      }

      if (inputResult.data.code === "EXPIRED10") {
        return cartMockService.createCartErrorResponse(
          "COUPON_EXPIRED",
          "This coupon has expired.",
          422,
          { fieldErrors: { code: ["This coupon has expired."] } },
        )
      }

      if (inputResult.data.code !== launchCoupon.code) {
        return cartMockService.createCartErrorResponse(
          "COUPON_INVALID",
          "This coupon is invalid.",
          422,
          { fieldErrors: { code: ["This coupon is invalid."] } },
        )
      }

      const cart = cartMockService.readCart(userId)
      const nextCart: StoredCart = {
        ...cart,
        couponCode: launchCoupon.code,
      }
      cartMockService.writeCart(userId, nextCart)

      return HttpResponse.json(cartMockService.createCartResponse(nextCart))
    }),

    http.delete("/api/cart/coupon", async ({ cookies }) => {
      const userId = getAuthenticatedUserId()
      const scenarioResponse =
        await cartMockService.resolveScenarioResponse(cookies)

      if (scenarioResponse) return scenarioResponse

      const cart = cartMockService.readCart(userId)
      const nextCart: StoredCart = { ...cart, couponCode: null }
      cartMockService.writeCart(userId, nextCart)

      return HttpResponse.json(cartMockService.createCartResponse(nextCart))
    }),
  ]
}
