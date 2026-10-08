import { expect, test, type Page } from "@playwright/test"

const EXTREME_MAX_PRICE_URL =
  "/?category=digital-art&maxPriceEth=%2210000000000000000000000000000000000000%22"

async function expectSearchParam(
  page: Page,
  name: string,
  expectedValue: string | null,
) {
  await expect
    .poll(() => {
      const value = new URL(page.url()).searchParams.get(name)

      if (value === null) return null

      try {
        return String(JSON.parse(value))
      } catch {
        return value
      }
    })
    .toBe(expectedValue)
}

test.describe("estado do catálogo na URL", () => {
  test.describe("desktop", () => {
    test.use({ viewport: { width: 1440, height: 1000 } })

    test("preserva paginação, filtros e ordenação no histórico", async ({
      page,
    }) => {
      await page.goto("/")

      const catalog = page.getByRole("region", { name: "Mercado de NFTs" })
      const filters = page.getByRole("complementary", {
        name: "Filtros do catálogo",
      })
      const collectiblesFilter = filters.getByRole("button", {
        name: /Colecionáveis/,
      })
      const ethereumFilter = filters.getByRole("button", {
        name: /Ethereum/,
      })

      await expect(catalog).toHaveAttribute("aria-busy", "false")
      await expect(catalog.getByRole("article")).toHaveCount(9)

      await catalog
        .getByRole("button", { name: "Ir para a página 2" })
        .click()
      await expectSearchParam(page, "page", "2")
      await expect(catalog).toHaveAttribute("aria-busy", "false")
      await expect(
        catalog.getByRole("heading", { name: "Resonance #064" }),
      ).toBeVisible()

      await collectiblesFilter.click()
      await expectSearchParam(page, "category", "collectibles")
      await expectSearchParam(page, "page", null)
      await expect(catalog).toHaveAttribute("aria-busy", "false")
      await expect(collectiblesFilter).toHaveAttribute("aria-pressed", "true")

      await page.goBack()
      await expectSearchParam(page, "category", null)
      await expectSearchParam(page, "page", "2")
      await expect(catalog).toHaveAttribute("aria-busy", "false")
      await expect(collectiblesFilter).toHaveAttribute("aria-pressed", "false")
      await expect(
        catalog.getByRole("heading", { name: "Resonance #064" }),
      ).toBeVisible()

      await page.goForward()
      await expectSearchParam(page, "category", "collectibles")
      await expectSearchParam(page, "page", null)
      await expect(catalog).toHaveAttribute("aria-busy", "false")
      await expect(collectiblesFilter).toHaveAttribute("aria-pressed", "true")

      await ethereumFilter.click()
      await expectSearchParam(page, "category", "collectibles")
      await expectSearchParam(page, "network", "ethereum")
      await expect(catalog).toHaveAttribute("aria-busy", "false")
      await expect(collectiblesFilter).toHaveAttribute("aria-pressed", "true")
      await expect(ethereumFilter).toHaveAttribute("aria-pressed", "true")
      await expect(catalog.getByRole("article")).toHaveCount(2)

      await catalog
        .getByRole("button", {
          name: /Ordenar por Listados recentemente/,
        })
        .click()
      await expectSearchParam(page, "sort", "price-asc")
      await expect(catalog).toHaveAttribute("aria-busy", "false")
      await expect(
        catalog.getByRole("article").first().getByRole("heading"),
      ).toHaveText("Archive Key #003")

      await page.reload()
      await expect(catalog).toHaveAttribute("aria-busy", "false")
      await expect(collectiblesFilter).toHaveAttribute("aria-pressed", "true")
      await expect(ethereumFilter).toHaveAttribute("aria-pressed", "true")
      await expectSearchParam(page, "category", "collectibles")
      await expectSearchParam(page, "network", "ethereum")
      await expectSearchParam(page, "sort", "price-asc")
      await expect(
        catalog.getByRole("article").first().getByRole("heading"),
      ).toHaveText("Archive Key #003")
    })

    test("corrige uma página acima do total disponível", async ({ page }) => {
      await page.goto("/?page=999")

      const catalog = page.getByRole("region", { name: "Mercado de NFTs" })

      await expectSearchParam(page, "page", "4")
      await expect(catalog).toHaveAttribute("aria-busy", "false")
      await expect(
        catalog.getByRole("heading", { name: "Astral Compass #027" }),
      ).toBeVisible()
    })

    test("volta ao início dos resultados ao trocar de página", async ({
      page,
    }) => {
      await page.goto("/")

      const catalog = page.getByRole("region", { name: "Mercado de NFTs" })
      const lastPage = catalog.getByRole("button", {
        name: "Ir para a página 4",
      })

      await expect(catalog).toHaveAttribute("aria-busy", "false")
      await lastPage.scrollIntoViewIfNeeded()
      await lastPage.click()

      await expectSearchParam(page, "page", "4")
      await expect(catalog).toHaveAttribute("aria-busy", "false")
      await expect(catalog).toBeFocused()
      await expect
        .poll(async () => Math.abs((await catalog.boundingBox())?.y ?? 100))
        .toBeLessThanOrEqual(1)
      await expect(
        catalog.getByRole("heading", { name: "Astral Compass #027" }),
      ).toBeVisible()
    })

    test("recupera parâmetros inválidos sem quebrar a rota", async ({
      page,
    }) => {
      await page.goto(
        "/?tab=unknown&category=unknown&sort=unknown&page=invalid&minPriceEth=invalid",
      )

      const catalog = page.getByRole("region", { name: "Mercado de NFTs" })

      await expect(catalog).toHaveAttribute("aria-busy", "false")
      await expect(catalog.getByRole("article")).toHaveCount(9)
      await expect(
        catalog.getByRole("tab", { name: "Todos os NFTs" }),
      ).toHaveAttribute("aria-selected", "true")
      await expect(
        catalog.getByRole("button", {
          name: /Ordenar por Listados recentemente/,
        }),
      ).toBeVisible()
    })

    test("limita um preço extremo da URL sem quebrar o filtro", async ({
      page,
    }) => {
      const pageErrors: Error[] = []
      page.on("pageerror", (error) => pageErrors.push(error))

      await page.goto(EXTREME_MAX_PRICE_URL)

      const catalog = page.getByRole("region", { name: "Mercado de NFTs" })
      const filters = page.getByRole("complementary", {
        name: "Filtros do catálogo",
      })

      await expect(catalog).toHaveAttribute("aria-busy", "false")
      await expect(catalog.getByRole("article")).toHaveCount(5)
      await expect(
        filters.getByRole("slider", { name: "Preço máximo" }),
      ).toHaveAttribute("aria-valuenow", "2.35")
      expect(pageErrors).toEqual([])
    })

    test("restaura a faixa de preço pelo histórico", async ({ page }) => {
      await page.goto("/?minPriceEth=0.06&maxPriceEth=0.84")

      const catalog = page.getByRole("region", { name: "Mercado de NFTs" })
      const filters = page.getByRole("complementary", {
        name: "Filtros do catálogo",
      })
      const minimumPrice = filters.getByRole("slider", {
        name: "Preço mínimo",
      })
      const applyPrice = filters.getByRole("button", { name: "Aplicar" })

      await expect(catalog).toHaveAttribute("aria-busy", "false")
      await expect(minimumPrice).toHaveAttribute("aria-valuenow", "0.06")

      await minimumPrice.press("ArrowRight")
      await applyPrice.click()
      await expectSearchParam(page, "minPriceEth", "0.07")
      await expect(catalog).toHaveAttribute("aria-busy", "false")

      await minimumPrice.press("ArrowRight")
      await applyPrice.click()
      await expectSearchParam(page, "minPriceEth", "0.08")
      await expect(catalog).toHaveAttribute("aria-busy", "false")

      await page.goBack()
      await expectSearchParam(page, "minPriceEth", "0.07")
      await expect(minimumPrice).toHaveAttribute("aria-valuenow", "0.07")
      await expect(catalog).toHaveAttribute("aria-busy", "false")

      await page.goForward()
      await expectSearchParam(page, "minPriceEth", "0.08")
      await expect(minimumPrice).toHaveAttribute("aria-valuenow", "0.08")
      await expect(catalog).toHaveAttribute("aria-busy", "false")
    })

    test("busca pelo header e restaura o estado pelo histórico", async ({
      page,
    }) => {
      await page.goto("/?page=2")

      const catalog = page.getByRole("region", { name: "Mercado de NFTs" })
      const searchTrigger = page.getByRole("button", { name: "Pesquisar" })

      await expect(catalog).toHaveAttribute("aria-busy", "false")
      await searchTrigger.click()

      const dialog = page.getByRole("dialog", { name: "Buscar NFTs" })
      const searchInput = dialog.getByRole("searchbox", { name: "Buscar NFTs" })

      await expect(dialog).toBeVisible()
      await expect(searchInput).toBeFocused()
      await searchInput.fill("Genesis")
      await dialog.getByRole("button", { name: "Buscar", exact: true }).click()

      await expect(dialog).toBeHidden()
      await expect(searchTrigger).toBeFocused()
      await expectSearchParam(page, "q", "Genesis")
      await expectSearchParam(page, "page", null)
      await expect(catalog).toHaveAttribute("aria-busy", "false")
      await expect(catalog.getByRole("article")).toHaveCount(3)

      await page.goBack()
      await expectSearchParam(page, "q", null)
      await expectSearchParam(page, "page", "2")
      await expect(catalog).toHaveAttribute("aria-busy", "false")

      await page.goForward()
      await expectSearchParam(page, "q", "Genesis")
      await expect(catalog).toHaveAttribute("aria-busy", "false")
      await expect(catalog.getByRole("article")).toHaveCount(3)

      await page.reload()
      await expect(catalog).toHaveAttribute("aria-busy", "false")
      await expectSearchParam(page, "q", "Genesis")
      await expect(catalog.getByRole("article")).toHaveCount(3)
    })
  })

  test.describe("mobile", () => {
    test.use({ viewport: { width: 390, height: 844 } })

    test("ajusta a página quando o tamanho do catálogo muda", async ({
      page,
    }) => {
      await page.goto("/?page=8")

      const catalog = page.getByRole("region", { name: "Mercado de NFTs" })

      await expect(catalog).toHaveAttribute("aria-busy", "false")
      await expectSearchParam(page, "page", "8")
      await expect(catalog.getByRole("article")).toHaveCount(2)

      await page.setViewportSize({ width: 1440, height: 1000 })

      await expectSearchParam(page, "page", "4")
      await expect(catalog).toHaveAttribute("aria-busy", "false")
      await expect(
        catalog.getByRole("heading", { name: "Astral Compass #027" }),
      ).toBeVisible()
    })

    test("preserva a busca após voltar, avançar e recarregar", async ({
      page,
    }) => {
      await page.goto("/?q=123")

      await expect(
        page.getByRole("searchbox", { name: "Explorar coleções" }),
      ).toHaveValue("123")
      await expect(
        page.getByRole("region", { name: "Mercado de NFTs" }),
      ).toHaveAttribute("aria-busy", "false")
      await expect(page.getByText("Nenhum NFT encontrado.")).toBeVisible()

      await page.goto("/")

      const catalog = page.getByRole("region", { name: "Mercado de NFTs" })
      const searchInput = page.getByRole("searchbox", {
        name: "Explorar coleções",
      })

      await expect(catalog).toHaveAttribute("aria-busy", "false")

      await searchInput.fill("Genesis")
      await searchInput.press("Enter")
      await expectSearchParam(page, "q", "Genesis")
      await expect(catalog).toHaveAttribute("aria-busy", "false")
      await expect(catalog.getByRole("article")).toHaveCount(3)

      await searchInput.fill("Signal")
      await searchInput.press("Enter")
      await expectSearchParam(page, "q", "Signal")
      await expect(catalog).toHaveAttribute("aria-busy", "false")
      await expect(catalog.getByRole("article")).toHaveCount(1)

      await page.goBack()
      await expectSearchParam(page, "q", "Genesis")
      await expect(searchInput).toHaveValue("Genesis")
      await expect(catalog).toHaveAttribute("aria-busy", "false")
      await expect(catalog.getByRole("article")).toHaveCount(3)

      await page.goForward()
      await expectSearchParam(page, "q", "Signal")
      await expect(searchInput).toHaveValue("Signal")
      await expect(catalog).toHaveAttribute("aria-busy", "false")
      await expect(catalog.getByRole("article")).toHaveCount(1)

      await page.reload()
      await expect(catalog).toHaveAttribute("aria-busy", "false")
      await expect(searchInput).toHaveValue("Signal")
      await expectSearchParam(page, "q", "Signal")
      await expect(catalog.getByRole("article")).toHaveCount(1)
    })

    test("abre os filtros com um preço extremo vindo da URL", async ({
      page,
    }) => {
      const pageErrors: Error[] = []
      page.on("pageerror", (error) => pageErrors.push(error))

      await page.goto(EXTREME_MAX_PRICE_URL)

      const catalog = page.getByRole("region", { name: "Mercado de NFTs" })
      await expect(catalog).toHaveAttribute("aria-busy", "false")
      await page.getByRole("button", { name: "Abrir filtros" }).click()

      const dialog = page.getByRole("dialog", {
        name: "Filtros e ordenação",
      })
      await expect(dialog).toBeVisible()
      await expect(
        dialog.getByRole("slider", { name: "Preço máximo" }),
      ).toHaveAttribute("aria-valuenow", "2.35")
      expect(pageErrors).toEqual([])
    })

    test("combina filtros e ordenação no drawer", async ({ page }) => {
      await page.goto("/?page=3")

      const catalog = page.getByRole("region", { name: "Mercado de NFTs" })
      const filtersTrigger = page.getByRole("button", { name: "Abrir filtros" })

      await expect(catalog).toHaveAttribute("aria-busy", "false")
      await filtersTrigger.click()

      let dialog = page.getByRole("dialog", { name: "Filtros e ordenação" })

      await expect(dialog).toBeVisible()
      await expect(
        page.locator('button[aria-label="Abrir filtros"]'),
      ).toHaveAttribute("aria-expanded", "true")
      await page.keyboard.press("Escape")
      await expect(dialog).toBeHidden()
      await expect(filtersTrigger).toBeFocused()

      await filtersTrigger.click()
      dialog = page.getByRole("dialog", { name: "Filtros e ordenação" })

      const collectiblesFilter = dialog.getByRole("button", {
        name: /Colecionáveis/,
      })
      const ethereumFilter = dialog.getByRole("button", {
        name: /Ethereum/,
      })
      const lowestPriceSort = dialog.getByRole("radio", {
        name: "Menor preço",
      })

      await collectiblesFilter.click()
      await expectSearchParam(page, "category", "collectibles")
      await expectSearchParam(page, "page", null)
      await ethereumFilter.click()
      await expectSearchParam(page, "network", "ethereum")
      await lowestPriceSort.check()
      await expectSearchParam(page, "sort", "price-asc")

      await dialog.getByRole("button", { name: "Ver resultados" }).click()
      await expect(dialog).toBeHidden()
      await expect(filtersTrigger).toBeFocused()
      await expect(catalog).toHaveAttribute("aria-busy", "false")
      await expect(catalog.getByRole("article")).toHaveCount(2)
      await expect(
        catalog.getByRole("heading", { name: "Archive Key #003" }),
      ).toBeVisible()

      await page.reload()
      await expect(catalog).toHaveAttribute("aria-busy", "false")
      await filtersTrigger.click()
      dialog = page.getByRole("dialog", { name: "Filtros e ordenação" })
      await expect(
        dialog.getByRole("button", { name: /Colecionáveis/ }),
      ).toHaveAttribute("aria-pressed", "true")
      await expect(
        dialog.getByRole("button", { name: /Ethereum/ }),
      ).toHaveAttribute("aria-pressed", "true")
      await expect(
        dialog.getByRole("radio", { name: "Menor preço" }),
      ).toBeChecked()

      await dialog.getByRole("button", { name: "Limpar filtros" }).click()
      await expectSearchParam(page, "category", null)
      await expectSearchParam(page, "network", null)
      await expectSearchParam(page, "sort", "price-asc")
      await expect(
        dialog.getByRole("button", { name: /Colecionáveis/ }),
      ).toHaveAttribute("aria-pressed", "false")
      await expect(
        dialog.getByRole("button", { name: /Ethereum/ }),
      ).toHaveAttribute("aria-pressed", "false")
    })
  })

  test.describe("tablet", () => {
    test.use({ viewport: { width: 768, height: 1024 } })

    test("usa o drawer responsivo sem overflow horizontal", async ({ page }) => {
      await page.goto("/")

      const catalog = page.getByRole("region", { name: "Mercado de NFTs" })
      const filtersTrigger = page.getByRole("button", { name: "Abrir filtros" })

      await expect(catalog).toHaveAttribute("aria-busy", "false")
      await filtersTrigger.click()

      const dialog = page.getByRole("dialog", { name: "Filtros e ordenação" })

      await expect(dialog).toBeVisible()
      await dialog.getByRole("button", { name: /Polygon/ }).click()
      await expectSearchParam(page, "network", "polygon")
      await dialog.getByRole("button", { name: "Ver resultados" }).click()
      await expect(catalog).toHaveAttribute("aria-busy", "false")
      await expect
        .poll(() =>
          page.evaluate<boolean>(
            "document.documentElement.scrollWidth <= document.documentElement.clientWidth",
          ),
        )
        .toBe(true)
    })
  })
})
