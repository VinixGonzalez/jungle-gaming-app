import { expect, test, type BrowserContext, type Page } from "@playwright/test"

import {
  expectNoHorizontalOverflow,
  genesisLimitedEdition,
  seedCart,
} from "./support/cart.js"
import { waitForMockService } from "./support/mock-readiness.js"
import { setMockScenario } from "./support/mock-scenario.js"

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

async function settleVisualState(page: Page) {
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

async function openCheckout(
  page: Page,
  context: BrowserContext,
  viewport: { width: number; height: number },
) {
  await page.setViewportSize(viewport)
  await page.emulateMedia({ reducedMotion: "reduce" })
  await setMockScenario(context, "default")
  await page.goto("/")
  await expect(
    page.getByRole("region", { name: "Mercado de NFTs" }),
  ).toHaveAttribute("aria-busy", "false")
  await loginThroughApi(page)
  await seedCart(page, [genesisLimitedEdition])
  await page.goto("/checkout")
  await expect(
    page.getByRole("button", { name: "Conectar carteira" }),
  ).toBeVisible()
  await expect(
    page.locator("[aria-labelledby='checkout-summary-title']"),
  ).toHaveAttribute("aria-busy", "false")
  await expect(page.getByText("0,955 ETH").first()).toBeVisible()
  await settleVisualState(page)
}

async function confirmOrder(page: Page) {
  await page.getByRole("button", { name: "Conectar carteira" }).click()
  await expect(page.getByRole("status")).toHaveText(
    "Carteira conectada com sucesso.",
  )
  await page.getByRole("button", { name: "Revisar compra" }).click()

  const review = page.getByRole("dialog", { name: "Revise sua compra" })

  await expect(review).toBeVisible()
  await review.getByRole("button", { name: "Confirmar pedido" }).click()
  await expect(page).toHaveURL(/\/orders\/order_[^/]+$/)

  const receipt = page
    .getByRole("dialog")
    .filter({ has: page.getByText("Genesis Circuit #014") })

  await expect(receipt).toBeVisible()
  await expect(receipt.getByText("Genesis Circuit #014")).toBeVisible()
  await settleVisualState(page)

  return {
    confirmedAt: receipt.locator("dl").first().locator("dd").nth(1),
    receipt,
    transactionReference: receipt.locator("dl").first().locator("dd").first(),
  }
}

test.describe("regressão visual do checkout", () => {
  test("pagamento desktop", async ({ context, page }) => {
    await openCheckout(page, context, { width: 1440, height: 1000 })

    await expect(page).toHaveScreenshot("checkout-desktop-1440x1000.png", {
      animations: "disabled",
      caret: "hide",
      fullPage: true,
      maxDiffPixelRatio: 0.001,
    })
  })

  test("pagamento mobile", async ({ context, page }) => {
    await openCheckout(page, context, { width: 390, height: 844 })
    await expectNoHorizontalOverflow(page)

    await expect(page).toHaveScreenshot("checkout-mobile-390x844.png", {
      animations: "disabled",
      caret: "hide",
      maxDiffPixelRatio: 0.001,
    })
  })

  test("recibo confirmado desktop", async ({ context, page }) => {
    await openCheckout(page, context, { width: 1440, height: 1000 })
    const receipt = await confirmOrder(page)

    await expect(page).toHaveScreenshot(
      "checkout-receipt-desktop-1440x1000.png",
      {
        animations: "disabled",
        caret: "hide",
        mask: [receipt.confirmedAt, receipt.transactionReference],
        maxDiffPixelRatio: 0.001,
      },
    )
  })

  test("recibo confirmado mobile", async ({ context, page }) => {
    await openCheckout(page, context, { width: 390, height: 844 })
    const receipt = await confirmOrder(page)

    await expectNoHorizontalOverflow(page)
    await expect(page).toHaveScreenshot(
      "checkout-receipt-mobile-390x844.png",
      {
        animations: "disabled",
        caret: "hide",
        mask: [receipt.confirmedAt, receipt.transactionReference],
        maxDiffPixelRatio: 0.001,
      },
    )
  })
})
