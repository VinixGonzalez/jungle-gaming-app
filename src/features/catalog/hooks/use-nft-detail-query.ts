import { useQuery } from "@tanstack/react-query"

import { nftDetailQueryOptions } from "../query/nft-detail-query-options"
import { useNftRealtimeSubscriptions } from "./use-nft-realtime-subscriptions"

export function useNftDetailQuery(slug: string) {
  const detailQuery = useQuery(nftDetailQueryOptions(slug))

  useNftRealtimeSubscriptions(
    detailQuery.data ? [detailQuery.data.item.id] : [],
  )

  return detailQuery
}
