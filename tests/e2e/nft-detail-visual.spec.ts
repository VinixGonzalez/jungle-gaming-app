import { expect, test, type Page } from "@playwright/test"

import { setMockScenario } from "./support/mock-scenario.js"

const DETAIL_PATH = "/nfts/genesis-circuit-014"

async function waitForDetail(page: Page) {
  await expect(
    page.getByRole("heading", { level: 1, name: "Genesis Circuit #014" }),
  ).toBeVisible()
  await expect(
    page.getByRole("button", { name: /^(COMPRAR|Comprar NFT)$/ }),
  ).toBeEnabled()
  await page.evaluate(
    `(async () => {
      await document.fonts.ready
      await Promise.all(Array.from(document.images, (image) => image.decode()))
      window.scrollTo(0, 0)
      await new Promise((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(resolve))
      })
    })()`,
  )
  await page.mouse.move(0, 0)
}

test.describe("regressão visual do detalhe do NFT", () => {
  test("desktop", async ({ context, page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.emulateMedia({ reducedMotion: "reduce" })
    await setMockScenario(context, "default")
    await page.goto(DETAIL_PATH)
    await waitForDetail(page)

    await expect(page).toHaveScreenshot("nft-detail-desktop-1440x1000.png", {
      animations: "disabled",
      caret: "hide",
      fullPage: true,
      maxDiffPixelRatio: 0.001,
    })
  })

  test("mobile", async ({ context, page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.emulateMedia({ reducedMotion: "reduce" })
    await setMockScenario(context, "default")
    await page.goto(DETAIL_PATH)
    await waitForDetail(page)

    await expect(page).toHaveScreenshot("nft-detail-mobile-390x844.png", {
      animations: "disabled",
      caret: "hide",
      maxDiffPixelRatio: 0.001,
    })
  })
})
