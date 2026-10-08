import { expect, test, type BrowserContext, type Page } from "@playwright/test"

import { expectNoHorizontalOverflow } from "./support/cart.js"
import { waitForMockService } from "./support/mock-readiness.js"
import { setMockScenario } from "./support/mock-scenario.js"
import { waitForVisualReadiness } from "./support/visual-readiness.js"

const credentials = {
  email: "luna.rocha@kurio.test",
  password: "Kurio@123",
}

async function loginThroughApi(page: Page) {
  await waitForMockService(page)
  const response = await page.evaluate(async (input) => {
    const result = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })

    return { body: await result.text(), status: result.status }
  }, credentials)

  expect(response.status, response.body).toBe(200)
}

async function openFavorites(
  page: Page,
  context: BrowserContext,
  viewport: { height: number; width: number },
) {
  await page.setViewportSize(viewport)
  await page.emulateMedia({ reducedMotion: "reduce" })
  await setMockScenario(context, "default")
  await page.goto("/")
  await expect(
    page.getByRole("region", { name: "Mercado de NFTs" }),
  ).toHaveAttribute("aria-busy", "false")
  await loginThroughApi(page)
  await page.goto("/favorites")
  await expect(
    page.getByRole("heading", { name: "Lista de interesse" }),
  ).toBeVisible()
  await waitForVisualReadiness(page)
}

test.describe("regressão visual dos favoritos", () => {
  test("desktop", async ({ context, page }) => {
    await openFavorites(page, context, { width: 1440, height: 1000 })

    await expect(page).toHaveScreenshot(
      "favorites-desktop-1440x1000.png",
      {
        animations: "disabled",
        caret: "hide",
        fullPage: true,
        maxDiffPixelRatio: 0.001,
      },
    )
  })

  test("mobile", async ({ context, page }) => {
    await openFavorites(page, context, { width: 390, height: 844 })
    await expectNoHorizontalOverflow(page)

    await expect(page).toHaveScreenshot("favorites-mobile-390x844.png", {
      animations: "disabled",
      caret: "hide",
      fullPage: true,
      maxDiffPixelRatio: 0.001,
    })
  })
})
