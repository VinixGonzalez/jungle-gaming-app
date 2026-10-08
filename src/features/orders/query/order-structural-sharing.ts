import type { Order } from "../api/order.schemas"

export function shareOrderResponse(
  currentData: unknown,
  nextData: unknown,
): Order {
  const current = currentData as Order | undefined
  const next = nextData as Order

  return current && current.version > next.version ? current : next
}
