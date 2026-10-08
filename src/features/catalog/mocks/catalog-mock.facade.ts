import type { CatalogQuery, Nft } from "../api/catalog.schemas"
import { queryCatalog } from "../model/query-catalog"
import { toCatalogItem } from "../model/to-catalog-item"
import { catalogInventoryStorage } from "./catalog-inventory-storage"
import { catalogRealtimeStorage } from "./catalog-realtime-storage"
import { catalogFixtureData } from "./catalog.fixtures"

interface InventoryPurchaseItem {
  nftId: string
  editionId: string
  quantity: number
}

const initialAvailableQuantityByEditionId = new Map(
  catalogFixtureData.items.flatMap((nft) =>
    nft.editions.map(
      (edition) => [edition.id, edition.availableQuantity] as const,
    ),
  ),
)

function applyCurrentInventory<T extends Nft>(fixtures: readonly T[]) {
  const purchasedQuantityByEditionId =
    catalogInventoryStorage.readPurchasedQuantities()

  return fixtures.map((nft) => {
    let purchasedQuantity = 0
    const realtimeUpdate = catalogRealtimeStorage.read(nft.id)
    const editions = nft.editions.map((edition) => {
      const editionPurchasedQuantity =
        purchasedQuantityByEditionId[edition.id] ?? 0
      const adjustment = realtimeUpdate?.adjustments.find(
        (candidate) => candidate.editionId === edition.id,
      )

      purchasedQuantity += editionPurchasedQuantity

      return {
        ...edition,
        priceEth: adjustment?.priceEth ?? edition.priceEth,
        availableQuantity: Math.max(
          0,
          edition.availableQuantity -
            editionPurchasedQuantity -
            (adjustment?.availableQuantityReduction ?? 0),
        ),
      }
    })

    return {
      ...nft,
      editions,
      version:
        nft.version + purchasedQuantity + (realtimeUpdate?.revision ?? 0),
    }
  })
}

export const catalogMockFacade = {
  get detailItems() {
    return applyCurrentInventory(catalogFixtureData.detailItems)
  },
  get items() {
    return applyCurrentInventory(catalogFixtureData.items)
  },
  findDetailBySlug(slug: string) {
    return catalogMockFacade.detailItems.find((item) => item.slug === slug)
  },
  getRelatedItems(item: Nft) {
    return catalogMockFacade.items
      .filter(
        (candidate) =>
          candidate.collection.id === item.collection.id &&
          candidate.id !== item.id,
      )
      .map(toCatalogItem)
  },
  hasFixtureSlug(slug: string) {
    return catalogFixtureData.items.some((item) => item.slug === slug)
  },
  query(query: CatalogQuery, empty = false) {
    return queryCatalog(
      empty ? [] : catalogMockFacade.items,
      query,
      new Date(catalogFixtureData.date),
    )
  },
  purchase(orderId: string, items: readonly InventoryPurchaseItem[]) {
    const hasInvalidItem = items.some((item) => {
      const nft = catalogFixtureData.items.find(
        (candidate) => candidate.id === item.nftId,
      )

      return !nft?.editions.some((edition) => edition.id === item.editionId)
    })

    if (hasInvalidItem) return { status: "unavailable" } as const

    return catalogInventoryStorage.purchase(
      orderId,
      items,
      initialAvailableQuantityByEditionId,
    )
  },
  toCatalogItem,
}
