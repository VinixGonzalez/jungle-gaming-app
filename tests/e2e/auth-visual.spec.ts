import { expect, test, type Page } from "@playwright/test"

import { setMockScenario } from "./support/mock-scenario.js"

async function prepareAuthScreenshot(
  page: Page,
  path: "/login" | "/register",
) {
  const title = path === "/login" ? "Entrar" : "Criar conta"

  await page.goto(path)
  await expect(page.getByRole("dialog", { name: title })).toBeVisible()
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
