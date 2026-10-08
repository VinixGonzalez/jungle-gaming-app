import { delay, http, HttpResponse } from "msw"

import type { CartResponse } from "@/features/cart"
import { mockApi } from "@/shared/mocks"
import { mockScenarioCookieName } from "@/shared/mocks"

import { createCheckoutQuoteInputSchema } from "../api/checkout.schemas"
import { checkoutMockService } from "./checkout-mock.service"

const checkoutResponseDelay = 200

interface CheckoutHandlerDependencies<StoredCart> {
  getAuthenticatedUserId: () => string | null
  readCart: (userId: string) => StoredCart
  createCartResponse: (cart: StoredCart) => CartResponse
}

function createCheckoutErrorResponse(
  code: string,
  message: string,
  status: number,
  fieldErrors?: Record<string, string[]>,
) {
  return mockApi.createErrorResponse(code, message, status, { fieldErrors })
}

function createAuthenticationRequiredResponse() {
  return createCheckoutErrorResponse(
    "AUTH_REQUIRED",
    "Authentication is required.",
    401,
  )
}

function isScenario(
  cookies: Record<string, string | undefined>,
  scenario: string,
) {
  return (
    cookies[mockScenarioCookieName] === scenario ||
    import.meta.env.VITE_MOCK_SCENARIO === scenario
  )
}

export function createCheckoutHandlers<StoredCart>({
  getAuthenticatedUserId,
  readCart,
  createCartResponse,
}: CheckoutHandlerDependencies<StoredCart>) {
  return [
    http.post("/api/checkout/quotes", async ({ cookies, request }) => {
      await delay(checkoutResponseDelay)

      const userId = getAuthenticatedUserId()

      if (!userId) return createAuthenticationRequiredResponse()

      const inputResult = createCheckoutQuoteInputSchema.safeParse(
        await mockApi.readJson(request),
      )

      if (!inputResult.success) {
        return createCheckoutErrorResponse(
          "INVALID_CHECKOUT_REQUEST",
          "The checkout request is invalid.",
          400,
          mockApi.createFieldErrors(inputResult.error.issues),
        )
      }

      const result = checkoutMockService.createQuote(
        userId,
        inputResult.data,
        createCartResponse(readCart(userId)),
        isScenario(cookies, "checkout-item-unavailable")
          ? "item-unavailable"
          : isScenario(cookies, "checkout-quote-changed")
            ? "quote-changed"
            : null,
      )

      if (result.status === "wallet-not-found") {
        return createCheckoutErrorResponse(
          "WALLET_NOT_FOUND",
          "The selected wallet was not found.",
          404,
        )
      }

      if (result.status === "unsupported-network") {
        return createCheckoutErrorResponse(
          "WALLET_NETWORK_UNSUPPORTED",
          "The selected wallet does not support this network.",
          409,
        )
      }

      if (result.status === "wallet-connection-required") {
        return createCheckoutErrorResponse(
          "WALLET_CONNECTION_REQUIRED",
          "Connect the selected wallet before requesting a quote.",
          409,
        )
      }

      if (result.status === "empty-cart") {
        return createCheckoutErrorResponse(
          "EMPTY_CART",
          "Add at least one available item before requesting a quote.",
          409,
        )
      }

      return HttpResponse.json(result.quote, { status: 201 })
    }),
  ]
}
