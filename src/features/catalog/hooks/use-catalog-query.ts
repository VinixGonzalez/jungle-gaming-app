import { keepPreviousData, useQuery } from "@tanstack/react-query"

import type { CatalogQuery } from "../api/catalog.schemas"
import { catalogQueryOptions } from "../query/catalog-query-options"
import { useNftRealtimeSubscriptions } from "./use-nft-realtime-subscriptions"

export function useCatalogQuery(input: CatalogQuery) {
  const catalogQuery = useQuery({
    ...catalogQueryOptions(input),
    placeholderData: keepPreviousData,
  })

  useNftRealtimeSubscriptions(
    catalogQuery.data?.items.map((item) => item.id) ?? [],
  )

  return catalogQuery
}
