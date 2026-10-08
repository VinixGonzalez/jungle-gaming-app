import { useEffect, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"

import { useSession } from "@/features/auth"
import { cartQueryKeys, cartRealtimeCache } from "@/features/cart"
import {
  catalogQueryCache,
  nftRealtimeCache,
  nftRealtimeStore,
  nftUpdatedEventSchema,
} from "@/features/catalog"
import {
  ordersQueryKeys,
  orderRealtimeCache,
  orderUpdatedEventSchema,
} from "@/features/orders"
import { realtimeClient } from "@/shared/realtime"

function settleReconciliation(promise: Promise<unknown>) {
  void promise.catch(() => undefined)
}

export function RealtimeProvider() {
  const queryClient = useQueryClient()
  const session = useSession()
  const [announcement, setAnnouncement] = useState("")
  const enabled = session.isSuccess
  const ownerId = session.data?.user.id ?? "guest"

  useEffect(() => {
    if (!enabled) return

    let hasConnected = false

    realtimeClient.setOwner(ownerId)

    const stopNftListener = realtimeClient.on("nft.updated", (payload) => {
      const result = nftUpdatedEventSchema.safeParse(payload)

      if (!result.success) return
      if (!nftRealtimeCache.apply(queryClient, result.data)) return

      nftRealtimeStore.publish(result.data)
      setAnnouncement(
        `Preço e disponibilidade de ${result.data.item.name} foram atualizados em tempo real.`,
      )
      cartRealtimeCache.apply(queryClient, ownerId, result.data)
      settleReconciliation(catalogQueryCache.invalidate(queryClient))
      settleReconciliation(
        queryClient.invalidateQueries({
          queryKey: cartQueryKeys.byOwner(ownerId),
        }),
      )
    })
    const stopOrderListener = realtimeClient.on("order.updated", (payload) => {
      const result = orderUpdatedEventSchema.safeParse(payload)

      if (!result.success) return
      if (!orderRealtimeCache.apply(queryClient, ownerId, result.data)) return

      setAnnouncement(
        result.data.order.status === "confirmed"
          ? "Pagamento confirmado em tempo real."
          : result.data.order.status === "refused"
            ? "Pagamento recusado em tempo real."
            : "Pedido atualizado em tempo real.",
      )
      if (result.data.order.status === "confirmed") {
        settleReconciliation(catalogQueryCache.invalidate(queryClient))
        settleReconciliation(
          queryClient.invalidateQueries({
            queryKey: cartQueryKeys.byOwner(ownerId),
          }),
        )
      }
    })
    const stopConnectListener = realtimeClient.onConnect(() => {
      if (!hasConnected) {
        hasConnected = true
        return
      }

      settleReconciliation(
        Promise.all([
          queryClient.invalidateQueries({
            queryKey: catalogQueryCache.catalogRootKey,
            refetchType: "active",
          }),
          queryClient.invalidateQueries({
            queryKey: catalogQueryCache.nftDetailRootKey,
            refetchType: "active",
          }),
          queryClient.invalidateQueries({
            queryKey: cartQueryKeys.byOwner(ownerId),
            refetchType: "active",
          }),
          queryClient.invalidateQueries({
            queryKey: ordersQueryKeys.byOwner(ownerId),
            refetchType: "active",
          }),
        ]),
      )
    })

    void realtimeClient.connect()

    return () => {
      stopNftListener()
      stopOrderListener()
      stopConnectListener()
      realtimeClient.disconnect()
    }
  }, [enabled, ownerId, queryClient])

  return (
    <p aria-atomic="true" aria-live="polite" className="sr-only">
      {announcement}
    </p>
  )
}
