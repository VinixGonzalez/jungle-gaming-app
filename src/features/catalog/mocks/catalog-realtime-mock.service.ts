import { catalogMockFacade } from "./catalog-mock.facade"
import { catalogRealtimeStorage } from "./catalog-realtime-storage"

const realtimeNftId = "nft_genesis_014"

export const catalogRealtimeMockService = {
  applyScenarioUpdate() {
    catalogRealtimeStorage.apply(realtimeNftId, [
      {
        editionId: "edition_genesis_014_unique",
        priceEth: "0.99",
      },
      {
        availableQuantityReduction: 4,
        editionId: "edition_genesis_014_limited",
        priceEth: "1.05",
      },
    ])

    return catalogMockFacade.items.find((nft) => nft.id === realtimeNftId)
  },
}
