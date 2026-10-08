import { expect, test } from "@playwright/test"

import {
  expectNoHorizontalOverflow,
  genesisLimitedEdition,
  populatedCartItems,
  seedCart,
  waitForPopulatedCart,
} from "./support/cart.js"
import {
  openAppWithMockScenario,
  setMockScenario,
} from "./support/mock-scenario.js"

test.describe("carrinho", () => {
  test("compra no detalhe e navega para o carrinho com a edição escolhida", async ({
    context,
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 1000 })
    await openAppWithMockScenario(
      page,
      context,
      "default",
      "/nfts/genesis-circuit-014",
    )
    await expect(
      page.getByRole("heading", { level: 1, name: "Genesis Circuit #014" }),
    ).toBeVisible()

    await page.getByRole("radio", { name: "1/10", exact: true }).press("Space")
    await page.getByRole("button", { name: "Aumentar quantidade" }).click()
    await page.getByRole("button", { name: "COMPRAR" }).click()

    await expect(page).toHaveURL(/\/cart$/)
    await waitForPopulatedCart(page)
    await expect(
      page.getByRole("link", { name: "Carrinho, 2 itens" }),
    ).toBeVisible()
    await expect(
      page.getByRole("group", { name: "Quantidade de Genesis Circuit #014" }),
    ).toContainText("2")
    await expect(page.getByRole("cell", { name: "1,9 ETH" })).toBeVisible()
  })

  test("adiciona no mobile sem sair do detalhe, mescla e persiste após refresh", async ({
    context,
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await openAppWithMockScenario(
      page,
      context,
      "default",
      "/nfts/genesis-circuit-014",
    )
    await expect(
      page.getByRole("heading", { level: 1, name: "Genesis Circuit #014" }),
    ).toBeVisible()

    await page.getByRole("radio", { name: "1/10", exact: true }).press("Space")
    const addButton = page.getByRole("button", { name: "Adicionar ao carrinho" })
    await addButton.click()
    await expect(page.getByText("1 item adicionado ao carrinho.")).toBeVisible()
    await expect(page).toHaveURL(/\/nfts\/genesis-circuit-014$/)

    const secondAddResponse = page.waitForResponse(
      (response) =>
        response.url().endsWith("/api/cart/items") &&
        response.request().method() === "POST",
    )
    await addButton.click()
    await secondAddResponse
    await expect(addButton).toBeEnabled()
    await page.goto("/cart")
    await waitForPopulatedCart(page)
    await expect(
      page.getByRole("group", { name: "Quantidade de Genesis Circuit #014" }),
    ).toContainText("2")

    await page.reload()
    await waitForPopulatedCart(page)
    await expect(
      page.getByRole("group", { name: "Quantidade de Genesis Circuit #014" }),
    ).toContainText("2")
  })

  test("não navega para o carrinho quando a compra falha", async ({
    context,
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 1000 })
    await openAppWithMockScenario(
      page,
      context,
      "default",
      "/nfts/genesis-circuit-014",
    )
    await expect(
      page.getByRole("heading", { level: 1, name: "Genesis Circuit #014" }),
    ).toBeVisible()
    await setMockScenario(context, "cart-server-error")

    await page.getByRole("button", { name: "COMPRAR" }).click()

    await expect(page.getByRole("alert")).toContainText(
      "Não foi possível adicionar ao carrinho",
    )
    await expect(page).toHaveURL(/\/nfts\/genesis-circuit-014$/)
  })

  test("atualiza a quantidade com resposta autoritativa e remove o último item", async ({
    context,
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 1000 })
    await setMockScenario(context, "default")
    await seedCart(page, [genesisLimitedEdition])
    await page.goto("/cart")
    await waitForPopulatedCart(page)

    await page
      .getByRole("button", { name: "Aumentar quantidade de Genesis Circuit #014" })
      .click()
    await expect(
      page.getByText("Quantidade de Genesis Circuit #014 atualizada para 2."),
    ).toBeVisible()
    await expect(page.getByText("1,9 ETH", { exact: true })).toHaveCount(2)
    await expect(page.getByText("1,905 ETH", { exact: true })).toBeVisible()

    await page
      .getByRole("button", { name: "Remover Genesis Circuit #014 do carrinho" })
      .click()
    await expect(
      page.getByRole("heading", { level: 1, name: "Seu carrinho está vazio" }),
    ).toBeVisible()
    await expect(page.getByRole("status")).toContainText(
      "Genesis Circuit #014 foi removido",
    )
    await expect(page.getByRole("link", { name: "Explorar NFTs" })).toHaveAttribute(
      "href",
      "/#catalogo",
    )
  })

  test("valida cupom expirado e inválido, aplica e remove um cupom válido", async ({
    context,
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await setMockScenario(context, "default")
    await seedCart(page, [genesisLimitedEdition])
    await page.goto("/cart")
    await waitForPopulatedCart(page)

    const couponInput = page.getByRole("textbox", { name: "Código do cupom" })
    const applyButton = page.getByRole("button", { name: "Aplicar" })

    await couponInput.fill("EXPIRED10")
    await applyButton.click()
    await expect(page.getByRole("alert")).toContainText("cupom expirou")

    await couponInput.fill("NAOEXISTE")
    await applyButton.click()
    await expect(page.getByRole("alert")).toContainText("Cupom inválido")

    await couponInput.fill("launch10")
    await applyButton.click()
    await expect(
      page.getByRole("button", { name: "Remover cupom LAUNCH10" }),
    ).toBeVisible()
    await expect(page.getByText("− 0,095 ETH", { exact: true })).toBeVisible()
    await expect(page.getByText("0,86 ETH", { exact: true })).toBeVisible()

    await page.getByRole("button", { name: "Remover cupom LAUNCH10" }).click()
    await expect(couponInput).toBeVisible()
    await expect(page.getByText("0,955 ETH", { exact: true })).toBeVisible()
  })

  test("faz rollback quando a atualização falha", async ({ context, page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await setMockScenario(context, "default")
    await seedCart(page, [genesisLimitedEdition])
    await page.goto("/cart")
    await waitForPopulatedCart(page)

    await setMockScenario(context, "cart-server-error")
    await page
      .getByRole("button", { name: "Aumentar quantidade de Genesis Circuit #014" })
      .click()

    await expect(page.getByRole("alert")).toContainText(
      "Não foi possível atualizar o carrinho",
    )
    await expect(
      page.getByRole("group", { name: "Quantidade de Genesis Circuit #014" }),
    ).toContainText("1")
    await expect(page.getByText("0,955 ETH", { exact: true })).toBeVisible()
  })

  test("exibe loading e recupera uma falha de consulta", async ({ context, page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await openAppWithMockScenario(page, context, "cart-slow", "/cart")
    await expect(
      page.getByRole("main", { name: "Carregando carrinho" }),
    ).toHaveAttribute("aria-busy", "true")
    await expect(
      page.getByRole("heading", { level: 1, name: "Seu carrinho está vazio" }),
    ).toBeVisible()

    await setMockScenario(context, "cart-server-error")
    await page.reload()
    const errorState = page.getByRole("alert")
    await expect(errorState).toContainText("Não foi possível carregar o carrinho")

    await setMockScenario(context, "default")
    await errorState.getByRole("button", { name: "Tentar novamente" }).click()
    await expect(
      page.getByRole("heading", { level: 1, name: "Seu carrinho está vazio" }),
    ).toBeVisible()
  })

  test("mantém a composição sem overflow em mobile, tablet e desktop", async ({
    context,
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await setMockScenario(context, "default")
    await seedCart(page, populatedCartItems)
    await page.goto("/cart")
    await waitForPopulatedCart(page)
    await expectNoHorizontalOverflow(page)

    await page.setViewportSize({ width: 768, height: 1024 })
    await expectNoHorizontalOverflow(page)

    await page.setViewportSize({ width: 1440, height: 1000 })
    await expectNoHorizontalOverflow(page)
    await expect(page.getByRole("table")).toBeVisible()
  })
})
