import { queryOptions } from "@tanstack/react-query"

import type { CatalogQuery } from "../api/catalog.schemas"
import { catalogStructuralSharing } from "./catalog-structural-sharing"
import { catalogQueryCache } from "./catalog-query-cache"

export function catalogQueryOptions(query: CatalogQuery) {
  return queryOptions({
    queryKey: catalogQueryCache.list(query),
    queryFn: async ({ signal }) => {
      const { getCatalog } = await import("../api/catalog.api")

      return getCatalog(query, signal)
    },
    structuralSharing: catalogStructuralSharing.list,
  })
}
