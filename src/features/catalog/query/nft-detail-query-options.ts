import { queryOptions } from "@tanstack/react-query"

import { catalogStructuralSharing } from "./catalog-structural-sharing"
import { catalogQueryCache } from "./catalog-query-cache"

export function nftDetailQueryOptions(slug: string) {
  return queryOptions({
    queryKey: catalogQueryCache.detail(slug),
    queryFn: async ({ signal }) => {
      const { getNftDetail } = await import("../api/nft-detail.api")

      return getNftDetail(slug, signal)
    },
    structuralSharing: catalogStructuralSharing.detail,
  })
}
