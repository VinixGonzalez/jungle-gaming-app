import type { QueryClient } from "@tanstack/react-query"

import type { CatalogQuery } from "../api/catalog.schemas"

const catalogRootKey = ["catalog"] as const
const nftDetailRootKey = ["nft-detail"] as const

export const catalogQueryCache = {
  catalogRootKey,
  nftDetailRootKey,
  list(query: CatalogQuery) {
    return [...catalogRootKey, "list", query] as const
  },
  detail(slug: string) {
    return [...nftDetailRootKey, slug] as const
  },
  async invalidate(queryClient: QueryClient) {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: catalogRootKey }),
      queryClient.invalidateQueries({ queryKey: nftDetailRootKey }),
    ])
  },
}
