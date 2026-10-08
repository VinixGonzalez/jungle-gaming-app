import { delay, http, HttpResponse } from "msw"

import {
  mockScenarioCookieName,
  resolveMockScenario,
} from "@/shared/mocks"
import { mockApi } from "@/shared/mocks"

import {
  createOrderInputSchema,
  orderIdempotencyKeySchema,
  orderIdSchema,
} from "../api/order.schemas"
import { orderMockService } from "./order-mock.service"

const ORDER_RESPONSE_DELAY = 200
const ORDER_TIMEOUT_AFTER_CREATE_DELAY = 10_500

interface OrderHandlerDependencies {
  getAuthenticatedUserId: () => string | null
}

function createOrderErrorResponse(
  code: string,
  message: string,
  status: number,
  options: {
    fieldErrors?: Record<string, string[]>
    retryable?: boolean
  } = {},
) {
  return mockApi.createErrorResponse(code, message, status, options)
}

function createAuthenticationRequiredResponse() {
  return createOrderErrorResponse(
    "AUTH_REQUIRED",
    "Authentication is required.",
    401,
  )
}

function createQuoteErrorResponse(status: string) {
  if (status === "missing") {
    return createOrderErrorResponse(
      "CHECKOUT_QUOTE_NOT_FOUND",
      "The checkout quote was not found.",
      404,
    )
  }

  if (status === "expired") {
    return createOrderErrorResponse(
      "CHECKOUT_QUOTE_EXPIRED",
      "The checkout quote has expired.",
      410,
    )
  }

  if (status === "wallet-disconnected") {
    return createOrderErrorResponse(
      "WALLET_CONNECTION_REQUIRED",
      "The selected wallet is no longer connected.",
      409,
    )
  }

  if (status === "empty-cart") {
    return createOrderErrorResponse(
      "EMPTY_CART",
      "The cart no longer contains items that can be purchased.",
      409,
    )
  }

  if (status === "item-unavailable") {
    return createOrderErrorResponse(
      "CHECKOUT_ITEM_UNAVAILABLE",
      "An item in this checkout quote is no longer available.",
      409,
    )
  }

  return createOrderErrorResponse(
    "CHECKOUT_QUOTE_CHANGED",
    "The checkout quote changed and must be confirmed again.",
    409,
  )
}

export function createOrderHandlers({
  getAuthenticatedUserId,
}: OrderHandlerDependencies) {
  return [
    http.post("/api/orders", async ({ cookies, request }) => {
      await delay(ORDER_RESPONSE_DELAY)

      const userId = getAuthenticatedUserId()

      if (!userId) return createAuthenticationRequiredResponse()

      const idempotencyKeyResult = orderIdempotencyKeySchema.safeParse(
        request.headers.get("Idempotency-Key"),
      )

      if (!idempotencyKeyResult.success) {
        return createOrderErrorResponse(
          "IDEMPOTENCY_KEY_REQUIRED",
          "A valid Idempotency-Key header is required.",
          400,
        )
      }

      const inputResult = createOrderInputSchema.safeParse(
        await mockApi.readJson(request),
      )

      if (!inputResult.success) {
        return createOrderErrorResponse(
          "INVALID_ORDER_REQUEST",
          "The order request body is invalid.",
          400,
          { fieldErrors: mockApi.createFieldErrors(inputResult.error.issues) },
        )
      }

      const result = orderMockService.create(
        userId,
        inputResult.data,
        idempotencyKeyResult.data,
      )

      if (result.status === "idempotency-conflict") {
        return createOrderErrorResponse(
          "IDEMPOTENCY_KEY_REUSED",
          "This idempotency key was already used with different content.",
          409,
        )
      }

      if (result.status !== "created" && result.status !== "existing") {
        return createQuoteErrorResponse(result.status)
      }

      const scenario = resolveMockScenario(
        cookies[mockScenarioCookieName],
        import.meta.env.VITE_MOCK_SCENARIO,
      )

      if (
        result.status === "created" &&
        scenario === "order-timeout-after-create"
      ) {
        await delay(ORDER_TIMEOUT_AFTER_CREATE_DELAY)
      }

      return HttpResponse.json(result.order, {
        status: result.status === "created" ? 201 : 200,
      })
    }),

    http.get("/api/orders/:orderId", async ({ cookies, params }) => {
      await delay(ORDER_RESPONSE_DELAY)

      const userId = getAuthenticatedUserId()

      if (!userId) return createAuthenticationRequiredResponse()

      const orderIdResult = orderIdSchema.safeParse(params.orderId)

      if (!orderIdResult.success) {
        return createOrderErrorResponse(
          "ORDER_NOT_FOUND",
          "The order was not found.",
          404,
        )
      }

      const order = orderMockService.find(userId, orderIdResult.data)

      if (!order) {
        return createOrderErrorResponse(
          "ORDER_NOT_FOUND",
          "The order was not found.",
          404,
        )
      }

      if (order.status !== "pending") return HttpResponse.json(order)

      const scenario = resolveMockScenario(
        cookies[mockScenarioCookieName],
        import.meta.env.VITE_MOCK_SCENARIO,
      )

      if (
        scenario === "order-pending" ||
        scenario === "realtime-order-reconnect"
      ) {
        return HttpResponse.json(order)
      }

      const nextOrder = scenario === "payment-declined"
        ? orderMockService.refuse(userId, order.id)
        : orderMockService.confirm(userId, order.id)

      return HttpResponse.json(nextOrder)
    }),
  ]
}
