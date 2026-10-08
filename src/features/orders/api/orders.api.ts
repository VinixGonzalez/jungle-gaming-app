import { httpClient } from "@/shared/api"

import {
  createOrderInputSchema,
  orderIdSchema,
  orderIdempotencyKeySchema,
  orderSchema,
  type CreateOrderInput,
} from "./order.schemas"

interface CreateOrderRequest {
  input: CreateOrderInput
  idempotencyKey: string
}

async function createOrder({ input, idempotencyKey }: CreateOrderRequest) {
  const body = createOrderInputSchema.parse(input)
  const parsedIdempotencyKey = orderIdempotencyKeySchema.parse(idempotencyKey)
  const response = await httpClient.post<unknown>("/orders", body, {
    headers: { "Idempotency-Key": parsedIdempotencyKey },
  })

  return orderSchema.parse(response.data)
}

async function getOrder(orderId: string, signal?: AbortSignal) {
  const parsedOrderId = orderIdSchema.parse(orderId)
  const response = await httpClient.get<unknown>(
    `/orders/${encodeURIComponent(parsedOrderId)}`,
    { signal },
  )

  return orderSchema.parse(response.data)
}

export const ordersApi = {
  create: createOrder,
  get: getOrder,
}
