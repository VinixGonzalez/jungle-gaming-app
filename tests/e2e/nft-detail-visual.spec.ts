import { expect, test, type Page } from "@playwright/test"

import { setMockScenario } from "./support/mock-scenario.js"
import { waitForVisualReadiness } from "./support/visual-readiness.js"

const DETAIL_PATH = "/nfts/genesis-circuit-014"

async function waitForDetail(page: Page) {
  await expect(
    page.getByRole("heading", { level: 1, name: "Genesis Circuit #014" }),
  ).toBeVisible()
  await expect(
    page.getByRole("button", { name: /^(COMPRAR|Comprar NFT)$/ }),
  ).toBeEnabled()
  await waitForVisualReadiness(page)
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
