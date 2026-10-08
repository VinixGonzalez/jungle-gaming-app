import { parseEthToWei } from "@/shared/utils"

import type { CatalogItem, Nft } from "../api/catalog.schemas"

function getLowestPricedEdition(nft: Nft) {
  const availableEditions = nft.editions.filter(
    (edition) => edition.availableQuantity > 0,
  )
  const editions = availableEditions.length > 0 ? availableEditions : nft.editions

  return editions.reduce((lowestEdition, edition) =>
    parseEthToWei(edition.priceEth) < parseEthToWei(lowestEdition.priceEth)
      ? edition
      : lowestEdition,
  )
}

export function toCatalogItem(nft: Nft): CatalogItem {
  const lowestPricedEdition = getLowestPricedEdition(nft)

  return {
    id: nft.id,
    slug: nft.slug,
    name: nft.name,
    category: nft.category,
    network: nft.network,
    collection: nft.collection,
    imageUrl: nft.imageUrl,
    thumbnailUrl: nft.thumbnailUrl,
    listedAt: nft.listedAt,
    isFeatured: nft.isFeatured,
    version: nft.version,
    priceEth: lowestPricedEdition.priceEth,
    availableQuantity: nft.editions.reduce(
      (total, edition) => total + edition.availableQuantity,
      0,
    ),
  }
}
