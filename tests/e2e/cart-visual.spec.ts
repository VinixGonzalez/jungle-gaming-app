import { expect, test, type Page } from "@playwright/test"

import {
  populatedCartItems,
  seedCart,
  waitForPopulatedCart,
} from "./support/cart.js"
import { setMockScenario } from "./support/mock-scenario.js"
import { waitForVisualReadiness } from "./support/visual-readiness.js"

async function prepareCartScreenshot(page: Page) {
  await page.goto("/cart")
  await waitForPopulatedCart(page)
  await waitForVisualReadiness(page)
}

test.describe("regressão visual do carrinho", () => {
  test("desktop", async ({ context, page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.emulateMedia({ reducedMotion: "reduce" })
    await setMockScenario(context, "default")
    await seedCart(page, populatedCartItems)
    await prepareCartScreenshot(page)

    await expect(page).toHaveScreenshot("cart-desktop-1440x1000.png", {
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
    await seedCart(page, populatedCartItems)
    await prepareCartScreenshot(page)

    await expect(page).toHaveScreenshot("cart-mobile-390x844.png", {
      animations: "disabled",
      caret: "hide",
      maxDiffPixelRatio: 0.001,
    })
  })
})
