import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"

import { identityQueryCache } from "@/shared/query"

import { useOrderQuery } from "./use-order-query"

function getRefusalMessage(code: string) {
  if (code === "CHECKOUT_ITEM_UNAVAILABLE") {
    return "Um item ficou indisponível antes da confirmação. Nenhum item foi removido do seu carrinho."
  }

  return "A carteira recusou o pagamento simulado. Nenhum item foi removido do seu carrinho."
}

export function useOrderController(orderId: string) {
  const queryClient = useQueryClient()
  const orderQuery = useOrderQuery(orderId)
  const isConfirmed = orderQuery.data?.status === "confirmed"

  useEffect(() => {
    if (!isConfirmed) return

    void queryClient.invalidateQueries({
      queryKey: [...identityQueryCache.rootKey, "cart"],
    })
  }, [isConfirmed, queryClient])

  if (orderQuery.isPending || (orderQuery.isFetching && !orderQuery.data)) {
    return { order: undefined, retry: orderQuery.refetch, status: "loading" as const }
  }

  if (!orderQuery.data) {
    return { order: undefined, retry: orderQuery.refetch, status: "error" as const }
  }

  if (orderQuery.data.status === "confirmed") {
    return {
      order: orderQuery.data,
      retry: orderQuery.refetch,
      status: "confirmed" as const,
    }
  }

  if (orderQuery.data.status === "refused") {
    return {
      message: getRefusalMessage(orderQuery.data.refusal.code),
      order: orderQuery.data,
      retry: orderQuery.refetch,
      status: "refused" as const,
    }
  }

  return {
    order: orderQuery.data,
    retry: orderQuery.refetch,
    status: "pending" as const,
  }
}
