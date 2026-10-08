import { useMemo } from "react"

import { useSession } from "@/features/auth"

import { cartQueryKeys } from "../query/cart-query-keys"

export function useCartCacheScope() {
  const session = useSession()
  const ownerId = session.data?.user.id ?? "guest"
  const queryKey = useMemo(() => cartQueryKeys.byOwner(ownerId), [ownerId])

  return {
    error: session.isError ? session.error : null,
    isReady: session.isSuccess,
    queryKey,
    retry: session.refetch,
  }
}
