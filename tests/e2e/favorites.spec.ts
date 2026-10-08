import { expect, test, type BrowserContext, type Page } from "@playwright/test"

import { expectNoHorizontalOverflow } from "./support/cart.js"
import { waitForMockService } from "./support/mock-readiness.js"
import { setMockScenario } from "./support/mock-scenario.js"

const credentials = {
  email: "luna.rocha@kurio.test",
  password: "Kurio@123",
}

async function waitForHome(page: Page) {
  await expect(
    page.getByRole("region", { name: "Mercado de NFTs" }),
  ).toHaveAttribute("aria-busy", "false")
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

async function registerThroughApi(page: Page) {
  await waitForMockService(page)
  const response = await page.evaluate(async () => {
    const result = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "estado.vazio@kurio.test",
        password: "Kurio@789",
        username: "estado.vazio",
      }),
    })

    return { body: await result.text(), status: result.status }
  })

  expect(response.status, response.body).toBe(201)
}

async function loginThroughForm(page: Page) {
  const dialog = page.getByRole("dialog", { name: "Entrar" })

  await dialog.getByLabel("E-mail", { exact: true }).fill(credentials.email)
  await dialog.getByLabel("Senha", { exact: true }).fill(credentials.password)
  await dialog.getByRole("button", { name: "Entrar", exact: true }).click()
}

async function openAuthenticatedPage(
  page: Page,
  context: BrowserContext,
  path: string,
) {
  await setMockScenario(context, "default")
  await page.goto("/")
  await waitForHome(page)
  await loginThroughApi(page)
  await page.goto(path)
}

test.describe("favoritos", () => {
  test("protege a lista e retorna ao destino após o login", async ({
    context,
    page,
  }) => {
    await setMockScenario(context, "default")
    await page.goto("/favorites?source=mobile")

    await expect.poll(() => new URL(page.url()).pathname).toBe("/login")
    expect(new URL(page.url()).searchParams.get("returnTo")).toBe(
      "/favorites?source=mobile",
    )

    await loginThroughForm(page)

    await expect(page).toHaveURL(/\/favorites\?source=mobile$/)
    await expect(
      page.getByRole("heading", { name: "Lista de interesse" }),
    ).toBeVisible()
    await expect(
      page.getByRole("link", { name: "Ver detalhes de Genesis Circuit #014" }),
    ).toBeVisible()
  })

  test("favorita no detalhe, persiste após refresh e permite remover", async ({
    context,
    page,
  }) => {
    await openAuthenticatedPage(
      page,
      context,
      "/nfts/rift-runner-103",
    )

    const favoriteButton = page.getByRole("button", { name: "Favoritar" })

    await expect(favoriteButton).toHaveAttribute("aria-pressed", "false")
    const addResponse = page.waitForResponse(
      (response) =>
        response.request().method() === "PUT" &&
        new URL(response.url()).pathname ===
          "/api/favorites/nft_rift_runner_103",
    )

    await favoriteButton.click()
    expect((await addResponse).status()).toBe(201)
    await expect(page.getByRole("status")).toContainText(
      "NFT adicionado aos favoritos.",
    )
    await expect(
      page.getByRole("button", { name: "Favoritado" }),
    ).toHaveAttribute("aria-pressed", "true")

    await page.reload()

    const favoritedButton = page.getByRole("button", { name: "Favoritado" })
    await expect(favoritedButton).toHaveAttribute("aria-pressed", "true")
    const removeResponse = page.waitForResponse(
      (response) =>
        response.request().method() === "DELETE" &&
        new URL(response.url()).pathname ===
          "/api/favorites/nft_rift_runner_103",
    )

    await favoritedButton.click()
    expect((await removeResponse).status()).toBe(200)
    await expect(page.getByRole("status")).toContainText(
      "NFT removido dos favoritos.",
    )
    await expect(
      page.getByRole("button", { name: "Favoritar" }),
    ).toHaveAttribute("aria-pressed", "false")
  })

  test("faz rollback após falha e recupera na tentativa seguinte", async ({
    context,
    page,
  }) => {
    await openAuthenticatedPage(
      page,
      context,
      "/nfts/rift-runner-103",
    )
    await setMockScenario(context, "favorite-mutation-error")

    const favoriteButton = page.getByRole("button", { name: "Favoritar" })
    const failedResponse = page.waitForResponse(
      (response) =>
        response.request().method() === "PUT" &&
        new URL(response.url()).pathname.includes("/api/favorites/"),
    )

    await favoriteButton.click()
    await expect(
      page.getByRole("button", { name: "Favoritado" }),
    ).toHaveAttribute("aria-pressed", "true")
    expect((await failedResponse).status()).toBe(503)
    await expect(page.getByRole("alert")).toContainText(
      "Não foi possível atualizar os favoritos.",
    )
    await expect(favoriteButton).toHaveAttribute("aria-pressed", "false")

    await setMockScenario(context, "default")
    const recoveredResponse = page.waitForResponse(
      (response) =>
        response.request().method() === "PUT" &&
        new URL(response.url()).pathname.includes("/api/favorites/"),
    )

    await favoriteButton.click()
    expect((await recoveredResponse).status()).toBe(201)
    await expect(
      page.getByRole("button", { name: "Favoritado" }),
    ).toHaveAttribute("aria-pressed", "true")
  })

  test("recupera uma falha de consulta da lista", async ({ context, page }) => {
    await openAuthenticatedPage(page, context, "/profile")
    await setMockScenario(context, "favorites-server-error")
    await page.goto("/favorites")

    await expect(
      page.getByRole("heading", {
        name: "Não foi possível carregar os favoritos",
      }),
    ).toBeVisible()

    await setMockScenario(context, "default")
    await page.getByRole("button", { name: "Tentar novamente" }).click()

    await expect(
      page.getByRole("heading", { name: "Lista de interesse" }),
    ).toBeVisible()
    await expect(
      page.getByRole("link", { name: "Ver detalhes de Genesis Circuit #014" }),
    ).toBeVisible()
  })

  test("orienta uma conta nova quando a lista está vazia", async ({
    context,
    page,
  }) => {
    await setMockScenario(context, "default")
    await page.goto("/")
    await waitForHome(page)
    await registerThroughApi(page)
    await page.goto("/favorites")

    await expect(
      page.getByRole("heading", {
        name: "Sua lista de interesse está vazia",
      }),
    ).toBeVisible()
    await expect(
      page.getByRole("link", { name: "Explorar NFTs" }),
    ).toHaveAttribute("href", "/#catalogo")
  })

  test("mantém a lista acessível e sem overflow no mobile e tablet", async ({
    context,
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await openAuthenticatedPage(page, context, "/favorites")

    await expectNoHorizontalOverflow(page)
    const navigation = page.getByRole("navigation", { name: "Minha conta" })
    const favoritesLink = navigation.getByRole("link", { name: "Favoritos" })

    await expect(favoritesLink).toHaveAttribute("aria-current", "page")
    await favoritesLink.focus()
    await expect(favoritesLink).toBeFocused()

    await page.setViewportSize({ width: 768, height: 1024 })
    await expectNoHorizontalOverflow(page)
  })
})
