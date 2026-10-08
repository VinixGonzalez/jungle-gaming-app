import { useQuery } from "@tanstack/react-query"

import { useNftRealtimeSubscriptions } from "@/features/catalog"
import { useMockServiceReady } from "@/shared/hooks"

import { cartApi } from "../api/cart.api"
import { shareCartResponse } from "../query/cart-structural-sharing"
import { useCartCacheScope } from "./use-cart-cache-scope"

export function useCartQuery() {
  const cartCache = useCartCacheScope()
  const isMockServiceReady = useMockServiceReady()
  const query = useQuery({
    queryKey: cartCache.queryKey,
    queryFn: ({ signal }) => cartApi.get(signal),
    enabled: cartCache.isReady && isMockServiceReady,
    staleTime: 0,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
    structuralSharing: shareCartResponse,
  })

  useNftRealtimeSubscriptions(
    query.data?.items.map((item) => item.product.id) ?? [],
  )

  return {
    ...query,
    data: cartCache.error ? undefined : query.data,
    error: cartCache.error ?? query.error,
    identityError: cartCache.error,
    isError: Boolean(cartCache.error) || query.isError,
    isPending: !cartCache.error && query.isPending,
    retry: cartCache.error ? cartCache.retry : query.refetch,
  }
}
