import { useEffect, useMemo } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"

import { useSession } from "@/features/auth"
import { catalogQueryCache } from "@/features/catalog"
import { realtimeClient } from "@/shared/realtime"

import { ordersApi } from "../api/orders.api"
import { ordersQueryKeys } from "../query/orders-query-keys"
import { shareOrderResponse } from "../query/order-structural-sharing"

export function useOrderQuery(orderId: string) {
  const queryClient = useQueryClient()
  const session = useSession()
  const ownerId = session.data?.user.id
  const queryKey = useMemo(
    () => ordersQueryKeys.detail(ownerId ?? "anonymous", orderId),
    [orderId, ownerId],
  )

  useEffect(() => {
    if (!ownerId) return

    return realtimeClient.subscribeToOrder(orderId)
  }, [orderId, ownerId])

  const orderQuery = useQuery({
    queryKey,
    queryFn: ({ signal }) => ordersApi.get(orderId, signal),
    enabled: Boolean(ownerId),
    refetchInterval: (query) =>
      query.state.data?.status === "pending" ? 700 : false,
    refetchOnReconnect: "always",
    refetchOnWindowFocus: "always",
    staleTime: 0,
    structuralSharing: shareOrderResponse,
  })

  useEffect(() => {
    if (orderQuery.data?.status !== "confirmed") return

    void catalogQueryCache.invalidate(queryClient)
  }, [orderQuery.data?.status, queryClient])

  return orderQuery
}
