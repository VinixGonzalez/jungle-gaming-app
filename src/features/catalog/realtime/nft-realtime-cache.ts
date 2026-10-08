import type { QueryClient } from "@tanstack/react-query"

import type {
  CatalogResponse,
  NftDetailResponse,
} from "../api/catalog.schemas"
import { catalogQueryCache } from "../query/catalog-query-cache"
import type { NftUpdatedEvent } from "./nft-updated-event.schema"

const latestVersionByNftId = new Map<string, number>()

function getKnownVersion(queryClient: QueryClient, nftId: string) {
  const catalogVersions = queryClient
    .getQueriesData<CatalogResponse>({
      queryKey: catalogQueryCache.catalogRootKey,
    })
    .flatMap(([, catalog]) =>
      catalog?.items
        .filter((item) => item.id === nftId)
        .map((item) => item.version) ?? [],
    )
  const detailVersions = queryClient
    .getQueriesData<NftDetailResponse>({
      queryKey: catalogQueryCache.nftDetailRootKey,
    })
    .flatMap(([, detail]) => {
      if (!detail) return []

      return [detail.item, ...detail.relatedItems]
        .filter((item) => item.id === nftId)
        .map((item) => item.version)
    })

  return Math.max(
    latestVersionByNftId.get(nftId) ?? 0,
    ...catalogVersions,
    ...detailVersions,
  )
}

function updateCatalogResponse(
  catalog: CatalogResponse | undefined,
  event: NftUpdatedEvent,
) {
  if (!catalog) return catalog

  return {
    ...catalog,
    featuredItem:
      catalog.featuredItem?.id === event.resourceId
        ? event.item
        : catalog.featuredItem,
    items: catalog.items.map((item) =>
      item.id === event.resourceId ? event.item : item,
    ),
  }
}

function updateDetailResponse(
  detail: NftDetailResponse | undefined,
  event: NftUpdatedEvent,
) {
  if (!detail) return detail

  return {
    ...detail,
    item:
      detail.item.id === event.resourceId
        ? {
            ...detail.item,
            editions: event.editions,
            version: event.version,
          }
        : detail.item,
    relatedItems: detail.relatedItems.map((item) =>
      item.id === event.resourceId ? event.item : item,
    ),
  }
}

export const nftRealtimeCache = {
  apply(queryClient: QueryClient, event: NftUpdatedEvent) {
    if (event.version <= getKnownVersion(queryClient, event.resourceId)) {
      return false
    }

    latestVersionByNftId.set(event.resourceId, event.version)
    queryClient.setQueriesData<CatalogResponse>(
      { queryKey: catalogQueryCache.catalogRootKey },
      (catalog) => updateCatalogResponse(catalog, event),
    )
    queryClient.setQueriesData<NftDetailResponse>(
      { queryKey: catalogQueryCache.nftDetailRootKey },
      (detail) => updateDetailResponse(detail, event),
    )

    return true
  },
}
