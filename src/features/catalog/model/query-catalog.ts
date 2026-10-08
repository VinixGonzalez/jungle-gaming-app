import { formatWeiToEth, parseEthToWei } from "@/shared/utils"

import {
  type CatalogFacets,
  type CatalogItem,
  type CatalogQuery,
  type CatalogResponse,
  type Nft,
} from "../api/catalog.schemas"
import { toCatalogItem } from "./to-catalog-item"

const NEW_RELEASE_WINDOW_IN_DAYS = 30
const TRENDING_SCORE_THRESHOLD = 70

function createFacets(items: readonly CatalogItem[]): CatalogFacets {
  if (items.length === 0) {
    return { categories: [], networks: [], priceRange: null }
  }

  const categoryCounts = new Map<CatalogItem["category"], number>()
  const networkCounts = new Map<CatalogItem["network"], number>()
  let minimumPrice = parseEthToWei(items[0].priceEth)
  let maximumPrice = minimumPrice

  for (const item of items) {
    categoryCounts.set(
      item.category,
      (categoryCounts.get(item.category) ?? 0) + 1,
    )
    networkCounts.set(item.network, (networkCounts.get(item.network) ?? 0) + 1)

    const price = parseEthToWei(item.priceEth)
    if (price < minimumPrice) minimumPrice = price
    if (price > maximumPrice) maximumPrice = price
  }

  return {
    categories: Array.from(categoryCounts, ([value, count]) => ({ value, count })),
    networks: Array.from(networkCounts, ([value, count]) => ({ value, count })),
    priceRange: {
      minEth: formatWeiToEth(minimumPrice),
      maxEth: formatWeiToEth(maximumPrice),
    },
  }
}

function isNewRelease(item: CatalogItem, now: Date) {
  const releaseTime = Date.parse(item.listedAt)
  const windowStart =
    now.getTime() - NEW_RELEASE_WINDOW_IN_DAYS * 24 * 60 * 60 * 1000

  return releaseTime >= windowStart && releaseTime <= now.getTime()
}

function compareByPrice(first: CatalogItem, second: CatalogItem) {
  const firstPrice = parseEthToWei(first.priceEth)
  const secondPrice = parseEthToWei(second.priceEth)

  return firstPrice < secondPrice ? -1 : firstPrice > secondPrice ? 1 : 0
}

export function queryCatalog(
  nfts: readonly Nft[],
  query: CatalogQuery,
  now: Date,
): CatalogResponse {
  const allItems = nfts.map(toCatalogItem)
  const trendingScoreById = new Map(
    nfts.map((nft) => [nft.id, nft.trendingScore] as const),
  )
  const normalizedSearch = query.q.toLocaleLowerCase("pt-BR")

  const filteredItems = allItems.filter((item) => {
    const matchesSearch =
      normalizedSearch.length === 0 ||
      item.name.toLocaleLowerCase("pt-BR").includes(normalizedSearch) ||
      item.collection.name.toLocaleLowerCase("pt-BR").includes(normalizedSearch)
    const matchesTab =
      query.tab === "all" ||
      (query.tab === "new" && isNewRelease(item, now)) ||
      (query.tab === "trending" &&
        (trendingScoreById.get(item.id) ?? 0) >= TRENDING_SCORE_THRESHOLD)
    const price = parseEthToWei(item.priceEth)
    const matchesMinimumPrice =
      !query.minPriceEth || price >= parseEthToWei(query.minPriceEth)
    const matchesMaximumPrice =
      !query.maxPriceEth || price <= parseEthToWei(query.maxPriceEth)

    return (
      matchesSearch &&
      matchesTab &&
      (!query.category || item.category === query.category) &&
      (!query.network || item.network === query.network) &&
      matchesMinimumPrice &&
      matchesMaximumPrice
    )
  })

  filteredItems.sort((first, second) => {
    if (query.sort === "price-asc") return compareByPrice(first, second)
    if (query.sort === "price-desc") return compareByPrice(second, first)
    return Date.parse(second.listedAt) - Date.parse(first.listedAt)
  })

  const totalItems = filteredItems.length
  const totalPages = Math.ceil(totalItems / query.pageSize)
  const startIndex = (query.page - 1) * query.pageSize

  return {
    items: filteredItems.slice(startIndex, startIndex + query.pageSize),
    featuredItem: allItems.find((item) => item.isFeatured) ?? null,
    facets: createFacets(allItems),
    pagination: {
      page: query.page,
      pageSize: query.pageSize,
      totalItems,
      totalPages,
    },
  }
}
