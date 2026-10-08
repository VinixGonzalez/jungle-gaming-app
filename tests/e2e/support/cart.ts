import { expect, type Page } from "@playwright/test"

import { waitForMockService } from "./mock-readiness.js"

export interface CartSeedItem {
  nftId: string
  editionId: string
  quantity: number
}

export const genesisLimitedEdition = {
  nftId: "nft_genesis_014",
  editionId: "edition_genesis_014_limited",
  quantity: 1,
} satisfies CartSeedItem

export const populatedCartItems = [
  { ...genesisLimitedEdition, quantity: 2 },
  {
    nftId: "nft_quiet_orbit_028",
    editionId: "edition_quiet_orbit_028",
    quantity: 1,
  },
  {
    nftId: "nft_signal_bloom_007",
    editionId: "edition_signal_bloom_007",
    quantity: 3,
  },
] satisfies CartSeedItem[]

export async function seedCart(
  page: Page,
  items: readonly CartSeedItem[] = populatedCartItems,
) {
  await page.goto("/")
  await waitForMockService(page)
  await expect(
    page.getByRole("region", { name: "Mercado de NFTs" }),
  ).toHaveAttribute("aria-busy", "false")

  for (const item of items) {
    const result = await page.evaluate(async (input) => {
      const response = await fetch("/api/cart/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      })

      return { status: response.status, body: await response.text() }
    }, item)

    expect(result.status, result.body).toBe(201)
  }
}

export async function waitForPopulatedCart(page: Page) {
  await expect(
    page.getByRole("heading", { level: 1, name: /carrinho/i }),
  ).toBeVisible()
  await expect(page.getByText("Genesis Circuit #014")).toBeVisible()
}

export async function expectNoHorizontalOverflow(page: Page) {
  await expect
    .poll(() =>
      page.evaluate<boolean>(
        "document.documentElement.scrollWidth <= document.documentElement.clientWidth",
      ),
    )
    .toBe(true)
}
