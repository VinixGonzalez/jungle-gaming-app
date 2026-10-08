import type {
  CatalogItem,
  CatalogResponse,
  NftDetailResponse,
} from "../api/catalog.schemas"

function keepNewerItem<T extends CatalogItem>(
  current: T | undefined,
  next: T,
) {
  return current && current.version > next.version ? current : next
}

function mergeCatalog(
  currentData: unknown,
  nextData: unknown,
): CatalogResponse {
  const current = currentData as CatalogResponse | undefined
  const next = nextData as CatalogResponse

  if (!current) return next

  const currentItems = new Map(
    [current.featuredItem, ...current.items]
      .filter((item): item is CatalogItem => Boolean(item))
      .map((item) => [item.id, item]),
  )

  return {
    ...next,
    featuredItem: next.featuredItem
      ? keepNewerItem(currentItems.get(next.featuredItem.id), next.featuredItem)
      : null,
    items: next.items.map((item) =>
      keepNewerItem(currentItems.get(item.id), item),
    ),
  }
}

function mergeDetail(
  currentData: unknown,
  nextData: unknown,
): NftDetailResponse {
  const current = currentData as NftDetailResponse | undefined
  const next = nextData as NftDetailResponse

  if (!current) return next

  const currentRelatedItems = new Map(
    current.relatedItems.map((item) => [item.id, item]),
  )

  return {
    item:
      current.item.version > next.item.version ? current.item : next.item,
    relatedItems: next.relatedItems.map((item) =>
      keepNewerItem(currentRelatedItems.get(item.id), item),
    ),
  }
}

export const catalogStructuralSharing = {
  detail: mergeDetail,
  list: mergeCatalog,
}
