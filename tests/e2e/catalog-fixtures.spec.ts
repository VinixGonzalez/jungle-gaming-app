import { expect, test } from "@playwright/test"

interface CatalogFixtureItem {
  collection: { id: string }
  imageUrl: string
  priceEth: string
  slug: string
  thumbnailUrl: string
}

interface CatalogFixtureResponse {
  facets: {
    categories: Array<{ count: number; value: string }>
    networks: Array<{ count: number; value: string }>
    priceRange: { minEth: string; maxEth: string } | null
  }
  items: CatalogFixtureItem[]
  pagination: { totalItems: number }
}

const newCollectionIds = new Set([
  "collection_algorithms",
  "collection_exposures",
  "collection_spectra",
  "collection_relics",
  "collection_frontier",
  "collection_reveries",
])

test("entrega vinte NFTs novos com dados e imagens únicos", async ({ page }) => {
  await page.goto("/")
  await expect(
    page.getByRole("region", { name: "Mercado de NFTs" }),
  ).toHaveAttribute("aria-busy", "false")

  const response = await page.evaluate(async () => {
    const result = await fetch("/api/nfts?pageSize=50")

    return {
      body: (await result.json()) as CatalogFixtureResponse,
      status: result.status,
    }
  })

  expect(response.status).toBe(200)
  expect(response.body.pagination.totalItems).toBe(30)

  const newItems = response.body.items.filter((item) =>
    newCollectionIds.has(item.collection.id),
  )

  expect(newItems).toHaveLength(20)
  expect(new Set(newItems.map((item) => item.imageUrl)).size).toBe(20)
  expect(new Set(newItems.map((item) => item.thumbnailUrl)).size).toBe(20)
  expect(new Set(newItems.map((item) => item.priceEth)).size).toBe(20)

  expect(
    Object.fromEntries(
      response.body.facets.categories.map(({ count, value }) => [value, count]),
    ),
  ).toEqual({
    "generative-art": 6,
    photography: 5,
    music: 5,
    gaming: 4,
    "digital-art": 5,
    collectibles: 5,
  })
  expect(
    Object.fromEntries(
      response.body.facets.networks.map(({ count, value }) => [value, count]),
    ),
  ).toEqual({ ethereum: 12, polygon: 10, solana: 8 })
  expect(response.body.facets.priceRange).toEqual({
    minEth: "0.06",
    maxEth: "2.35",
  })

  const detailStatuses = await page.evaluate(
    async (slugs) => {
      const statuses: number[] = []

      for (const slug of slugs) {
        statuses.push((await fetch(`/api/nfts/${slug}`)).status)
      }

      return statuses
    },
    newItems.map((item) => item.slug),
  )

  expect(detailStatuses).toEqual(Array.from({ length: 20 }, () => 200))
})
