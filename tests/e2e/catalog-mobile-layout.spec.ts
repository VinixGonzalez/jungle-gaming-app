import { expect, test, type Page } from "@playwright/test"

import { setMockScenario } from "./support/mock-scenario.js"

async function openCatalog(page: Page, width: number, height: number) {
  await page.setViewportSize({ height, width })
  await page.goto("/")

  const catalog = page.getByRole("region", { name: "Mercado de NFTs" })

  await expect(catalog).toHaveAttribute("aria-busy", "false")

  return catalog
}

async function expectRowAligned(
  cards: ReturnType<Page["locator"]>,
  indexes: readonly number[],
) {
  const boxes = await Promise.all(
    indexes.map((index) => cards.nth(index).boundingBox()),
  )
  const firstTop = boxes[0]?.y

  expect(firstTop).toBeDefined()

  for (const box of boxes) {
    expect(box).not.toBeNull()
    expect(Math.abs(box!.y - firstTop!)).toBeLessThanOrEqual(1)
  }
}

test.describe("layout responsivo do catálogo", () => {
  test.beforeEach(async ({ context }) => {
    await setMockScenario(context, "default")
  })

  test("alinha duas colunas e mantém todas as abas visíveis no mobile", async ({
    page,
  }) => {
    const catalog = await openCatalog(page, 390, 844)
    const cards = catalog.locator("article")

    await expectRowAligned(cards, [0, 1])
    await expectRowAligned(cards, [2, 3])

    for (const tabName of ["Todos os NFTs", "Novos lançamentos", "Em alta"]) {
      await expect(catalog.getByRole("tab", { name: tabName })).toBeInViewport()
    }

    await expect
      .poll(() =>
        page.evaluate<boolean>(
          "document.documentElement.scrollWidth <= document.documentElement.clientWidth",
        ),
      )
      .toBe(true)
  })

  test("alinha três colunas e mantém todas as abas visíveis no tablet", async ({
    page,
  }) => {
    const catalog = await openCatalog(page, 768, 1024)
    const cards = catalog.locator("article")

    await expectRowAligned(cards, [0, 1, 2])
    await expectRowAligned(cards, [3, 4, 5])

    for (const tabName of ["Todos os NFTs", "Novos lançamentos", "Em alta"]) {
      await expect(catalog.getByRole("tab", { name: tabName })).toBeInViewport()
    }
  })
})
