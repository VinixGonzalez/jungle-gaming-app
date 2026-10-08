import { expect, test, type Page } from "@playwright/test"

import {
  openAppWithMockScenario,
  setMockScenario,
} from "./support/mock-scenario.js"

const DETAIL_PATH = "/nfts/genesis-circuit-014"
const DETAIL_TITLE = "Genesis Circuit #014"

async function waitForDetail(page: Page, title = DETAIL_TITLE) {
  await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible()
}

async function expectNoHorizontalOverflow(page: Page) {
  await expect
    .poll(() =>
      page.evaluate<boolean>(
        "document.documentElement.scrollWidth <= document.documentElement.clientWidth",
      ),
    )
    .toBe(true)
}

test.describe("detalhe do NFT", () => {
  test.describe("desktop", () => {
    test.use({ viewport: { width: 1440, height: 1000 } })

    test("permite acesso direto e recarregamento da rota", async ({
      context,
      page,
    }) => {
      await openAppWithMockScenario(page, context, "default", DETAIL_PATH)
      await waitForDetail(page)

      await expect(page).toHaveURL(new RegExp(`${DETAIL_PATH}$`))
      await expect(page).toHaveTitle(`${DETAIL_TITLE} | Kurio`)

      await page.reload()

      await waitForDetail(page)
      await expect(page).toHaveTitle(`${DETAIL_TITLE} | Kurio`)
    })

    test("exibe o carregamento durante uma resposta lenta", async ({
      context,
      page,
    }) => {
      await openAppWithMockScenario(
        page,
        context,
        "nft-detail-slow",
        DETAIL_PATH,
      )

      await expect(
        page.getByRole("main", { name: "Carregando detalhes do NFT" }),
      ).toHaveAttribute("aria-busy", "true")
      await waitForDetail(page)
    })

    test("recupera o detalhe após uma resposta HTTP 503", async ({
      context,
      page,
    }) => {
      await openAppWithMockScenario(
        page,
        context,
        "nft-detail-server-error",
        DETAIL_PATH,
      )

      const errorState = page.getByRole("alert")

      await expect(errorState).toContainText("Não foi possível carregar o NFT")
      await setMockScenario(context, "default")
      await errorState.getByRole("button", { name: "Tentar novamente" }).click()

      await waitForDetail(page)
    })

    test("apresenta um estado seguro para um NFT inexistente", async ({
      context,
      page,
    }) => {
      const pageErrors: Error[] = []
      page.on("pageerror", (error) => pageErrors.push(error))

      await openAppWithMockScenario(
        page,
        context,
        "default",
        "/nfts/nft-inexistente",
      )

      await expect(
        page.getByRole("heading", { level: 1, name: "NFT não encontrado" }),
      ).toBeVisible()
      await expect(
        page.getByRole("link", { name: "Voltar ao mercado" }),
      ).toHaveAttribute("href", "/#catalogo")
      expect(pageErrors).toEqual([])
    })

    test("respeita a disponibilidade máxima da edição selecionada", async ({
      context,
      page,
    }) => {
      await openAppWithMockScenario(page, context, "default", DETAIL_PATH)
      await waitForDetail(page)

      const limitedEdition = page.getByRole("radio", {
        name: "1/10",
        exact: true,
      })
      const archivedEdition = page.getByRole("radio", {
        name: /1\/5 ESGOTADA/,
      })
      const quantity = page.locator(
        'output[aria-label="Quantidade selecionada"]',
      )
      const increment = page.getByRole("button", {
        name: "Aumentar quantidade",
      })
      const decrement = page.getByRole("button", {
        name: "Diminuir quantidade",
      })

      await expect(
        page.getByRole("radio", { name: "1/1", exact: true }),
      ).toBeChecked()
      await expect(decrement).toBeDisabled()
      await expect(archivedEdition).toBeDisabled()
      await limitedEdition.press("Space")
      await expect(limitedEdition).toBeChecked()
      await expect(decrement).toBeDisabled()
      await expect(page.getByText(/0[,.]95 ETH/, { exact: true })).toBeVisible()

      for (let value = 2; value <= 6; value += 1) {
        await increment.click()
        await expect(quantity).toHaveText(String(value))
      }

      await expect(decrement).toBeEnabled()
      await expect(increment).toBeDisabled()
    })

    test("bloqueia quantidade e compra quando todas as edições esgotaram", async ({
      context,
      page,
    }) => {
      await openAppWithMockScenario(
        page,
        context,
        "default",
        "/nfts/rift-runner-103",
      )
      await waitForDetail(page, "Rift Runner #103")

      await expect(page.getByText("NFT esgotado.")).toBeVisible()
      await expect(page.getByText("Edição esgotada")).toBeVisible()
      await expect(page.getByRole("group", { name: "Quantidade" })).toHaveCount(
        0,
      )
      await expect(page.getByRole("button", { name: "ESGOTADO" })).toBeDisabled()
      await expect(page.getByRole("button", { name: "Favoritar" })).toBeEnabled()
    })
  })

  test.describe("navegação e responsividade", () => {
    test("permite navegar pela galeria no mobile", async ({
      context,
      page,
    }) => {
      await page.setViewportSize({ width: 390, height: 844 })
      await openAppWithMockScenario(page, context, "default", DETAIL_PATH)
      await waitForDetail(page)

      const gallery = page.getByRole("region", {
        name: `Galeria de ${DETAIL_TITLE}`,
      })
      const firstImage = gallery.getByRole("img", {
        name: `Vista principal de ${DETAIL_TITLE}`,
      })
      const firstSource = await firstImage.getAttribute("src")

      await gallery.getByRole("button", { name: "Exibir imagem 2" }).click()

      const secondImage = gallery.getByRole("img", {
        name: `Composição completa de ${DETAIL_TITLE}`,
      })
      await expect(secondImage).toBeVisible()
      await expect(secondImage).not.toHaveAttribute("src", firstSource ?? "")

      await gallery.focus()
      await gallery.press("Home")
      await expect(firstImage).toBeVisible()
      await gallery.press("ArrowRight")
      await expect(secondImage).toBeVisible()
    })

    test("volta ao catálogo preservando os parâmetros da busca", async ({
      context,
      page,
    }) => {
      await page.setViewportSize({ width: 390, height: 844 })
      await setMockScenario(context, "default")
      await page.goto("/?q=Signal")

      const catalog = page.getByRole("region", { name: "Mercado de NFTs" })
      await expect(catalog).toHaveAttribute("aria-busy", "false")
      await catalog
        .getByRole("link", { name: "Ver detalhes de Signal Bloom #007" })
        .click()
      await waitForDetail(page, "Signal Bloom #007")

      await page.getByRole("button", { name: "Voltar" }).click()

      await expect(page).toHaveURL(/\?q=Signal$/)
      await expect(catalog).toHaveAttribute("aria-busy", "false")
      await expect(
        page.getByRole("searchbox", { name: "Explorar coleções" }),
      ).toHaveValue("Signal")
    })

    test("não cria overflow horizontal em mobile e tablet", async ({
      context,
      page,
    }) => {
      await page.setViewportSize({ width: 390, height: 844 })
      await openAppWithMockScenario(page, context, "default", DETAIL_PATH)
      await waitForDetail(page)
      await expectNoHorizontalOverflow(page)

      await page.setViewportSize({ width: 768, height: 1024 })
      await waitForDetail(page)
      await expectNoHorizontalOverflow(page)
    })
  })
})
