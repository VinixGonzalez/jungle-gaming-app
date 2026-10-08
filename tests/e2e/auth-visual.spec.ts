import { expect, test, type Page } from "@playwright/test"

import { setMockScenario } from "./support/mock-scenario.js"
import { waitForVisualReadiness } from "./support/visual-readiness.js"

async function prepareAuthScreenshot(
  page: Page,
  path: "/login" | "/register",
) {
  const title = path === "/login" ? "Entrar" : "Criar conta"

  await page.goto(path)
  await expect(page.getByRole("dialog", { name: title })).toBeVisible()
  await waitForVisualReadiness(page)
}

test.describe("regressão visual da autenticação", () => {
  for (const authCase of [
    { name: "login", path: "/login" as const },
    { name: "register", path: "/register" as const },
  ]) {
    test(`${authCase.name} desktop`, async ({ context, page }) => {
      await page.setViewportSize({ width: 1440, height: 1000 })
      await page.emulateMedia({ reducedMotion: "reduce" })
      await setMockScenario(context, "default")
      await prepareAuthScreenshot(page, authCase.path)

      await expect(page).toHaveScreenshot(
        `auth-${authCase.name}-desktop-1440x1000.png`,
        {
          animations: "disabled",
          caret: "hide",
          maxDiffPixelRatio: 0.001,
        },
      )
    })

    test(`${authCase.name} mobile`, async ({ context, page }) => {
      await page.setViewportSize({ width: 414, height: 896 })
      await page.emulateMedia({ reducedMotion: "reduce" })
      await setMockScenario(context, "default")
      await prepareAuthScreenshot(page, authCase.path)

      await expect(page).toHaveScreenshot(
        `auth-${authCase.name}-mobile-414x896.png`,
        {
          animations: "disabled",
          caret: "hide",
          maxDiffPixelRatio: 0.001,
        },
      )
    })
  }
})
