import type { QueryClient } from "@tanstack/react-query"

import type { Order } from "../api/order.schemas"
import { ordersQueryKeys } from "../query/orders-query-keys"
import type { OrderUpdatedEvent } from "./order-updated-event.schema"

export const orderRealtimeCache = {
  apply(
    queryClient: QueryClient,
    ownerId: string,
    event: OrderUpdatedEvent,
  ) {
    if (event.ownerId !== ownerId) return false

    const queryKey = ordersQueryKeys.detail(ownerId, event.resourceId)
    const currentOrder = queryClient.getQueryData<Order>(queryKey)

    if (
      (currentOrder && currentOrder.status !== "pending") ||
      (currentOrder?.version ?? 0) >= event.version
    ) {
      return false
    }

    queryClient.setQueryData(queryKey, event.order)

    return true
  },
}
