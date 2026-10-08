import { expect, test, type Page } from "@playwright/test"

import { setMockScenario } from "./support/mock-scenario.js"

async function waitForHome(page: Page) {
  const catalog = page.getByRole("region", { name: "Mercado de NFTs" })

  await expect(catalog).toHaveAttribute("aria-busy", "false")
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
