import { expect, test } from "@playwright/test"

import {
  openAppWithMockScenario,
  resetMockScenario,
  setMockScenario,
} from "./support/mock-scenario.js"

test.describe("resiliência do catálogo", () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test("exibe shimmer durante latência e respeita movimento reduzido", async ({
    context,
    page,
  }) => {
    await openAppWithMockScenario(page, context, "catalog-slow")

    const loadingState = page.getByRole("region", {
      name: "Carregando mercado de NFTs",
    })
    const firstSkeleton = loadingState.locator('[data-slot="skeleton"]').first()
    const shimmer = firstSkeleton.locator('[data-slot="skeleton-shimmer"]')

    await expect(loadingState).toBeVisible()
    await expect(shimmer).toHaveClass(/motion-safe:animate-skeleton-shimmer/)
    await expect
      .poll(() =>
        page.evaluate<string>(
          "getComputedStyle(document.querySelector('[data-slot=\"skeleton-shimmer\"]')).animationName",
        ),
      )
      .toBe("skeleton-shimmer")

    await page.emulateMedia({ reducedMotion: "reduce" })
    await expect
      .poll(() =>
        page.evaluate<string>(
          "getComputedStyle(document.querySelector('[data-slot=\"skeleton-shimmer\"]')).animationName",
        ),
      )
      .toBe("none")

    const catalog = page.getByRole("region", { name: "Mercado de NFTs" })

    await expect(catalog).toHaveAttribute("aria-busy", "false")
    await expect(catalog.getByRole("article")).toHaveCount(4)
  })

  test("recupera o catálogo após uma resposta HTTP 503", async ({
    context,
    page,
  }) => {
    await openAppWithMockScenario(page, context, "catalog-server-error")

    const errorState = page.getByRole("alert")

    await expect(errorState).toContainText(
      "Não foi possível carregar o catálogo.",
    )

    const retryButton = errorState.getByRole("button", {
      name: "Tentar novamente",
    })

    await setMockScenario(context, "catalog-slow")
    await retryButton.click()
    await expect(
      page.getByRole("region", { name: "Carregando mercado de NFTs" }),
    ).toBeVisible()

    const catalog = page.getByRole("region", { name: "Mercado de NFTs" })

    await expect(catalog).toHaveAttribute("aria-busy", "false")
    await expect(catalog.getByRole("article")).toHaveCount(4)
    await resetMockScenario(context)
  })

  test("recupera o catálogo após indisponibilidade de conexão", async ({
    context,
    page,
  }) => {
    await openAppWithMockScenario(page, context, "catalog-network-error")

    const errorState = page.getByRole("alert")

    await expect(errorState).toContainText(
      "Não foi possível carregar o catálogo.",
    )

    await resetMockScenario(context)
    await errorState.getByRole("button", { name: "Tentar novamente" }).click()

    const catalog = page.getByRole("region", { name: "Mercado de NFTs" })

    await expect(catalog).toHaveAttribute("aria-busy", "false")
    await expect(catalog.getByRole("article")).toHaveCount(4)
  })

  test("descarta uma resposta lenta depois de uma busca mais recente", async ({
    context,
    page,
  }) => {
    await openAppWithMockScenario(page, context, "catalog-out-of-order")

    const catalog = page.getByRole("region", { name: "Mercado de NFTs" })
    const searchInput = page.getByRole("searchbox", {
      name: "Explorar coleções",
    })

    await expect(catalog).toHaveAttribute("aria-busy", "false")

    const slowRequest = page.waitForRequest((request) => {
      const url = new URL(request.url())

      return url.pathname === "/api/nfts" && url.searchParams.get("q") === "Genesis"
    })

    await searchInput.fill("Genesis")
    await searchInput.press("Enter")
    await slowRequest

    await searchInput.fill("Signal")
    await searchInput.press("Enter")

    await expect(catalog).toHaveAttribute("aria-busy", "false")
    await expect(catalog.getByRole("article")).toHaveCount(1)
    await expect(
      catalog.getByRole("heading", { name: "Signal Bloom #007" }),
    ).toBeVisible()

    await page.waitForTimeout(1_300)
    await expect(
      catalog.getByRole("heading", { name: "Signal Bloom #007" }),
    ).toBeVisible()
    await expect(
      catalog.getByRole("heading", { name: /Genesis/ }),
    ).toHaveCount(0)
  })
})
