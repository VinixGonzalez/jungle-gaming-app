import { expect, test, type Page } from "@playwright/test"

import { setMockScenario } from "./support/mock-scenario.js"
import { waitForVisualReadiness } from "./support/visual-readiness.js"

async function waitForHome(page: Page) {
  const catalog = page.getByRole("region", { name: "Mercado de NFTs" })

  await expect(catalog).toHaveAttribute("aria-busy", "false")
  await waitForVisualReadiness(page)
}

test.describe("regressão visual da home", () => {
  test("desktop", async ({ context, page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.emulateMedia({ reducedMotion: "reduce" })
    await setMockScenario(context, "default")
    await page.goto("/")
    await waitForHome(page)

    await expect(page).toHaveScreenshot("home-desktop-1440x1000.png", {
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
    await page.goto("/")
    await waitForHome(page)

    await expect(page).toHaveScreenshot("home-mobile-390x844.png", {
      animations: "disabled",
      caret: "hide",
      maxDiffPixelRatio: 0.001,
    })
  })
})
