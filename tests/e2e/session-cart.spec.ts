import { expect, test, type Page } from "@playwright/test"

import {
  genesisLimitedEdition,
  seedCart,
  waitForPopulatedCart,
} from "./support/cart.js"
import { waitForMockService } from "./support/mock-readiness.js"
import { setMockScenario } from "./support/mock-scenario.js"

const users = {
  luna: {
    email: "luna.rocha@kurio.test",
    password: "Kurio@123",
    username: "luna.rocha",
  },
  davi: {
    email: "davi.moura@kurio.test",
    password: "Kurio@456",
    username: "davi.moura",
  },
}

interface ApiRequestInput {
  path: string
  method?: "GET" | "POST" | "DELETE"
  body?: unknown
}

async function requestFromBrowser(page: Page, input: ApiRequestInput) {
  await waitForMockService(page)

  return page.evaluate(async ({ path, method = "GET", body }) => {
    const response = await fetch(path, {
      method,
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    })

    return {
      status: response.status,
    }
  }, input)
}

async function loginThroughForm(
  page: Page,
  credentials: (typeof users)[keyof typeof users],
  variant: "desktop" | "mobile" = "desktop",
) {
  await page.getByRole("link", { name: "Entrar", exact: true }).click()

  const dialog = page.getByRole("dialog", { name: "Entrar" })

  await dialog.getByLabel("E-mail", { exact: true }).fill(credentials.email)
  await dialog.getByLabel("Senha", { exact: true }).fill(credentials.password)
  await dialog.getByRole("button", { name: "Entrar", exact: true }).click()

  await expect(
    page.getByRole("button", {
      name:
        variant === "desktop"
          ? `@${credentials.username}`
          : `Abrir conta de ${credentials.username}`,
      exact: variant === "desktop",
    }),
  ).toBeVisible()
}

async function loginThroughApi(
  page: Page,
  credentials: (typeof users)[keyof typeof users],
) {
  const response = await requestFromBrowser(page, {
    path: "/api/auth/login",
    method: "POST",
    body: {
      email: credentials.email,
      password: credentials.password,
    },
  })

  expect(response.status).toBe(200)
}

async function logoutThroughApi(page: Page) {
  const response = await requestFromBrowser(page, {
    path: "/api/auth/session",
    method: "DELETE",
  })

  expect(response.status).toBe(204)
}

async function applyLaunchCoupon(page: Page) {
  const response = await requestFromBrowser(page, {
    path: "/api/cart/coupon",
    method: "POST",
    body: { code: "LAUNCH10" },
  })

  expect(response.status).toBe(200)
}

async function logoutThroughAccount(page: Page, username: string) {
  await page
    .getByRole("button", { name: `@${username}`, exact: true })
    .click()

  const accountDialog = page.getByRole("dialog", { name: "Sua conta" })

  await accountDialog.getByRole("button", { name: "Sair" }).click()
  await expect(page.getByRole("link", { name: "Entrar" })).toBeVisible()
}

test.describe("sessão e carrinho por identidade", () => {
  test.beforeEach(async ({ context }) => {
    await setMockScenario(context, "default")
  })

  test("preserva carrinho e cupom do visitante no login, refresh e guardas", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 1000 })
    await seedCart(page, [genesisLimitedEdition])
    await applyLaunchCoupon(page)
    await page.goto("/cart")
    await waitForPopulatedCart(page)

    await loginThroughForm(page, users.luna)
    await expect(page).toHaveURL(/\/cart$/)
    await expect(
      page.getByRole("button", { name: "Remover cupom LAUNCH10" }),
    ).toBeVisible()
    await expect(
      page
        .getByRole("group", { name: "Quantidade de Genesis Circuit #014" })
        .getByText("1", { exact: true }),
    ).toBeVisible()

    await page.reload()
    await waitForPopulatedCart(page)
    await expect(
      page.getByRole("button", { name: "@luna.rocha", exact: true }),
    ).toBeVisible()
    await expect(
      page.getByRole("button", { name: "Remover cupom LAUNCH10" }),
    ).toBeVisible()
    await expect(
      page
        .getByRole("group", { name: "Quantidade de Genesis Circuit #014" })
        .getByText("1", { exact: true }),
    ).toBeVisible()

    await page.goto("/login?returnTo=%2Fcart")
    await expect(page).toHaveURL(/\/cart$/)
    await expect(page.getByRole("dialog", { name: "Entrar" })).toHaveCount(0)

    await page.goto("/register?returnTo=%2Fcart")
    await expect(page).toHaveURL(/\/cart$/)
    await expect(
      page.getByRole("dialog", { name: "Criar conta" }),
    ).toHaveCount(0)
  })

  test("mantém a sessão quando o logout falha e permite tentar novamente", async ({
    context,
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.goto("/")
    await loginThroughForm(page, users.luna)

    await page
      .getByRole("button", { name: "@luna.rocha", exact: true })
      .click()
    const accountDialog = page.getByRole("dialog", { name: "Sua conta" })

    await expect(accountDialog).toContainText("luna.rocha@kurio.test")
    await setMockScenario(context, "auth-logout-error")
    await accountDialog.getByRole("button", { name: "Sair" }).click()
    await expect(accountDialog.getByRole("alert")).toHaveText(
      "Não foi possível sair. Tente novamente.",
    )

    const activeSessionResponse = await requestFromBrowser(page, {
      path: "/api/auth/session",
    })
    expect(activeSessionResponse.status).toBe(200)

    await setMockScenario(context, "default")
    await accountDialog.getByRole("button", { name: "Sair" }).click()
    await expect(page.getByRole("link", { name: "Entrar" })).toBeVisible()
    await expect(page).toHaveURL("/")

    const sessionResponse = await requestFromBrowser(page, {
      path: "/api/auth/session",
    })
    expect(sessionResponse.status).toBe(401)
  })

  test("expira a sessão sem expor o carrinho da conta ao visitante", async ({
    context,
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.goto("/")
    await loginThroughForm(page, users.luna)
    await seedCart(page, [genesisLimitedEdition])

    await setMockScenario(context, "auth-session-expired")
    await page.reload()
    await expect(page.getByRole("link", { name: "Entrar" })).toBeVisible()

    await setMockScenario(context, "default")
    await page.goto("/cart")
    await expect(
      page.getByRole("heading", { name: "Seu carrinho está vazio" }),
    ).toBeVisible()

    await loginThroughForm(page, users.luna)
    await expect(
      page.getByRole("group", { name: "Quantidade de Genesis Circuit #014" }),
    ).toBeVisible()
  })

  test("limita a soma do merge ao estoque e preserva o cupom da conta", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.goto("/")
    await loginThroughApi(page, users.luna)
    await seedCart(page, [{ ...genesisLimitedEdition, quantity: 5 }])
    await applyLaunchCoupon(page)
    await logoutThroughApi(page)

    await seedCart(page, [{ ...genesisLimitedEdition, quantity: 3 }])
    await loginThroughApi(page, users.luna)
    await page.goto("/cart")
    await waitForPopulatedCart(page)
    await expect(
      page.getByRole("group", { name: "Quantidade de Genesis Circuit #014" }),
    ).toContainText("6")
    await expect(
      page.getByRole("button", { name: "Remover cupom LAUNCH10" }),
    ).toBeVisible()
  })

  test("troca de conta limpa o cache privado sem recarregar a aplicação", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 1000 })
    await seedCart(page, [{ ...genesisLimitedEdition, quantity: 2 }])
    await loginThroughForm(page, users.luna)
    await expect(
      page.getByRole("link", { name: "Carrinho, 2 itens" }),
    ).toBeVisible()

    await logoutThroughAccount(page, users.luna.username)
    await expect(
      page.getByRole("link", { name: "Carrinho, 0 itens" }),
    ).toBeVisible()

    const guestItemResponse = await requestFromBrowser(page, {
      path: "/api/cart/items",
      method: "POST",
      body: {
        nftId: "nft_quiet_orbit_028",
        editionId: "edition_quiet_orbit_028",
        quantity: 1,
      },
    })
    expect(guestItemResponse.status).toBe(201)

    await loginThroughForm(page, users.davi)
    await expect(
      page.getByRole("link", { name: "Carrinho, 1 item" }),
    ).toBeVisible()

    await logoutThroughAccount(page, users.davi.username)
    await loginThroughForm(page, users.luna)
    await expect(
      page.getByRole("link", { name: "Carrinho, 2 itens" }),
    ).toBeVisible()
  })

  test("mescla o carrinho do visitante ao criar uma conta", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 })
    await seedCart(page, [
      {
        nftId: "nft_signal_bloom_007",
        editionId: "edition_signal_bloom_007",
        quantity: 2,
      },
    ])
    await page.goto("/register?returnTo=%2Fcart")

    const dialog = page.getByRole("dialog", { name: "Criar conta" })

    await dialog
      .getByLabel("Nome de usuário", { exact: true })
      .fill("nova.colecionadora")
    await dialog
      .getByLabel("E-mail", { exact: true })
      .fill("nova.colecionadora@kurio.test")
    await dialog.getByLabel("Senha", { exact: true }).fill("Segura@123")
    await dialog
      .getByLabel("Confirmar senha", { exact: true })
      .fill("Segura@123")
    await dialog
      .getByRole("button", { name: "Criar conta", exact: true })
      .click()

    await expect(page).toHaveURL(/\/cart$/)
    await expect(page.getByText("Signal Bloom #007")).toBeVisible()
    await expect(
      page.getByRole("group", { name: "Quantidade de Signal Bloom #007" }),
    ).toContainText("2")
  })

  test("migra o carrinho legado para o visitante sem perder itens", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        "kurio_mock_cart_v1",
        JSON.stringify({
          items: [
            {
              nftId: "nft_genesis_014",
              editionId: "edition_genesis_014_limited",
              quantity: 2,
            },
          ],
          couponCode: null,
        }),
      )
    })

    await page.goto("/cart")
    await waitForPopulatedCart(page)
    await expect(
      page.getByRole("group", { name: "Quantidade de Genesis Circuit #014" }),
    ).toContainText("2")

    const storageState = await page.evaluate(() => ({
      legacy: localStorage.getItem("kurio_mock_cart_v1"),
      current: localStorage.getItem("kurio_mock_cart_v2"),
    }))

    expect(storageState.legacy).toBeNull()
    expect(JSON.parse(storageState.current ?? "null")).toMatchObject({
      guestCart: {
        items: [{ quantity: 2 }],
      },
      cartsByUserId: {},
    })
  })

  test("permite abrir a conta e sair pelo mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto("/")
    await loginThroughForm(page, users.luna, "mobile")

    const accountButton = page.getByRole("button", {
      name: "Abrir conta de luna.rocha",
    })

    await accountButton.click()
    const accountDialog = page.getByRole("dialog", { name: "Sua conta" })

    await expect(accountDialog).toBeVisible()
    await accountDialog.getByRole("button", { name: "Sair" }).click()
    await expect(page.getByRole("link", { name: "Entrar" })).toBeVisible()
  })
})
