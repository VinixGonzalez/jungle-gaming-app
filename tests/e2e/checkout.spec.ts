import {
  expect,
  test,
  type BrowserContext,
  type Page,
  type Request,
} from "@playwright/test"

import {
  expectNoHorizontalOverflow,
  genesisLimitedEdition,
  seedCart,
} from "./support/cart.js"
import { waitForMockService } from "./support/mock-readiness.js"
import { setMockScenario } from "./support/mock-scenario.js"

type MockScenario = Parameters<typeof setMockScenario>[1]

const credentials = {
  email: "luna.rocha@kurio.test",
  password: "Kurio@123",
}

interface ObservedOrderRequest {
  idempotencyKey: string | undefined
  body: string | null
}

async function waitForHome(page: Page) {
  await waitForMockService(page)
  await expect(
    page.getByRole("region", { name: "Mercado de NFTs" }),
  ).toHaveAttribute("aria-busy", "false")
}

async function loginThroughApi(page: Page) {
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

async function loginThroughForm(page: Page) {
  const dialog = page.getByRole("dialog", { name: "Entrar" })

  await dialog.getByLabel("E-mail", { exact: true }).fill(credentials.email)
  await dialog.getByLabel("Senha", { exact: true }).fill(credentials.password)
  await dialog.getByRole("button", { name: "Entrar", exact: true }).click()
}

async function openAuthenticatedCheckout(
  page: Page,
  context: BrowserContext,
  scenario: MockScenario = "default",
) {
  await setMockScenario(context, scenario)
  await page.goto("/")
  await waitForHome(page)
  await loginThroughApi(page)
  await seedCart(page, [genesisLimitedEdition])
  await page.goto("/checkout")
  await expect(
    page.getByRole("button", { name: "Conectar carteira" }),
  ).toBeVisible()
}

async function connectWalletAndOpenReview(page: Page) {
  await page.getByRole("button", { name: "Conectar carteira" }).click()
  await expect(page.getByRole("status")).toHaveText(
    "Carteira conectada com sucesso.",
  )
  await page.getByRole("button", { name: "Revisar compra" }).click()

  const review = page.getByRole("dialog", { name: "Revise sua compra" })

  await expect(review).toBeVisible()
  await expect(review.getByText("Genesis Circuit #014")).toBeVisible()

  return review
}

function observeOrderRequests(page: Page) {
  const requests: ObservedOrderRequest[] = []

  page.on("request", (request) => {
    if (!isCreateOrderRequest(request)) return

    const headers = request.headers()

    requests.push({
      idempotencyKey: headers["idempotency-key"],
      body: request.postData(),
    })
  })

  return requests
}

function isCreateOrderRequest(request: Request) {
  const url = new URL(request.url())

  return request.method() === "POST" && url.pathname === "/api/orders"
}

test.describe("checkout", () => {
  test("retoma o checkout após o login, confirma uma única vez e esvazia o carrinho", async ({
    context,
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 1000 })
    await setMockScenario(context, "default")
    await seedCart(page, [genesisLimitedEdition])
    await page.goto("/cart")

    await page.getByRole("button", { name: "Ir para pagamento" }).click()

    await expect
      .poll(() => new URL(page.url()).pathname)
      .toBe("/login")
    await expect
      .poll(() => new URL(page.url()).searchParams.get("returnTo"))
      .toBe("/checkout")

    await loginThroughForm(page)
    await expect(page).toHaveURL(/\/checkout$/)
    await expect(
      page.getByRole("heading", { name: "Perfil do colecionador" }),
    ).toBeVisible()

    const orderRequests = observeOrderRequests(page)
    const review = await connectWalletAndOpenReview(page)
    const confirmOrder = review.getByRole("button", {
      name: "Confirmar pedido",
    })

    await confirmOrder.evaluate((button) => {
      const clickable = button as unknown as { click: () => void }

      clickable.click()
      clickable.click()
    })

    await expect(page).toHaveURL(/\/orders\/order_[^/]+$/)
    const receipt = page.getByRole("dialog", {
      name: "Seus NFTs agora estão na sua carteira",
    })

    await expect(receipt).toBeVisible()
    await expect(receipt.getByText("ID da transação")).toBeVisible()
    await expect(receipt.getByText("Genesis Circuit #014")).toBeVisible()
    await expect(
      receipt.getByRole("link", { name: "Ver no explorador" }),
    ).toHaveAttribute("href", /etherscan\.io\/tx\/0x/)
    expect(orderRequests).toHaveLength(1)

    await page.goto("/cart")
    await expect(
      page.getByRole("heading", { name: "Seu carrinho está vazio" }),
    ).toBeVisible()
  })

  test("mantém dados, carteiras, provedor e revisão acessíveis no mobile sem overflow", async ({
    context,
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await openAuthenticatedCheckout(page, context)

    await expect(
      page.getByRole("heading", { name: "Pagamento com carteira" }),
    ).toBeVisible()
    await expect(
      page.getByRole("radio", { name: /Carteira principal/ }),
    ).toBeChecked()
    await expect(
      page.getByRole("radio", { name: "WalletConnect" }),
    ).toBeVisible()
    await expect(page.getByRole("radio", { name: "MetaMask" })).toBeVisible()
    await expect(
      page.getByRole("radio", { name: "Coinbase Wallet" }),
    ).toBeChecked()

    await page.locator("summary").click()
    await expect(
      page.getByRole("textbox", { name: "Nome de exibição" }),
    ).toHaveValue("Luna Rocha")
    await expect(page.getByRole("textbox", { name: "E-mail" })).toHaveValue(
      credentials.email,
    )
    await expectNoHorizontalOverflow(page)

    await page.setViewportSize({ width: 768, height: 1024 })
    await expectNoHorizontalOverflow(page)
    const network = page.getByRole("combobox", {
      name: "Rede",
      exact: true,
    })

    await expect(network).toBeEnabled()
    await network.selectOption("polygon")
    await expect(network).toHaveValue("polygon")

    const review = await connectWalletAndOpenReview(page)

    await expect(review.getByText("Luna Rocha", { exact: true })).toBeVisible()
    await expect(review.getByText("0,955 ETH", { exact: true })).toBeVisible()
    await expectNoHorizontalOverflow(page)
  })

  test("normaliza espaços do nome e letras maiúsculas do e-mail na revisão", async ({
    context,
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 1000 })
    await openAuthenticatedCheckout(page, context)

    await page
      .getByRole("textbox", { name: "Nome de exibição" })
      .fill("  Luna Rocha  ")
    await page
      .getByRole("textbox", { name: "E-mail", exact: true })
      .fill("LUNA.ROCHA@KURIO.TEST")

    const review = await connectWalletAndOpenReview(page)

    await expect(review.getByText("Luna Rocha", { exact: true })).toBeVisible()
    await expect(
      review.getByText("luna.rocha@kurio.test", { exact: true }),
    ).toBeVisible()
  })

  test("mantém o checkout bloqueado quando a conexão da carteira é recusada", async ({
    context,
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 1000 })
    await openAuthenticatedCheckout(page, context, "wallet-connection-refused")

    const checkoutAttempts: string[] = []

    page.on("request", (request) => {
      const pathname = new URL(request.url()).pathname

      if (
        pathname === "/api/checkout/quotes" ||
        isCreateOrderRequest(request)
      ) {
        checkoutAttempts.push(pathname)
      }
    })

    await page.getByRole("button", { name: "Conectar carteira" }).click()

    await expect(page.getByRole("status")).toHaveText(
      "A conexão foi recusada na carteira. Tente novamente quando estiver pronto.",
    )
    await expect(
      page.getByRole("button", { name: "Revisar compra" }),
    ).toBeDisabled()
    expect(checkoutAttempts).toEqual([])
  })

  test("preserva o rascunho e o retorno quando a sessão expira durante o checkout", async ({
    context,
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 1000 })
    await openAuthenticatedCheckout(page, context)

    const notes = "Entregar este NFT na carteira secundária."

    await page
      .getByRole("textbox", { name: "Observações para o colecionador" })
      .fill(notes)
    await page
      .getByRole("combobox", { name: "Carteira", exact: true })
      .selectOption("wallet_luna_secondary")
    await page
      .getByRole("combobox", { name: "Tipo de carteira" })
      .selectOption("metamask")
    await page.getByRole("button", { name: "Conectar carteira" }).click()
    await expect(page.getByRole("status")).toHaveText(
      "Carteira conectada com sucesso.",
    )

    await setMockScenario(context, "auth-session-expired")
    const expiredSessionStatus = await page.evaluate(async () => {
      const response = await fetch("/api/auth/session")

      return response.status
    })

    expect(expiredSessionStatus).toBe(401)
    await page.getByRole("button", { name: "Revisar compra" }).click()
    await expect
      .poll(() => new URL(page.url()).pathname)
      .toBe("/login")
    await expect
      .poll(() => new URL(page.url()).searchParams.get("returnTo"))
      .toBe("/checkout")

    await setMockScenario(context, "default")
    await loginThroughForm(page)

    await expect(page).toHaveURL(/\/checkout$/)
    await expect(
      page.getByRole("textbox", { name: "Observações para o colecionador" }),
    ).toHaveValue(notes)
    await expect(
      page.getByRole("combobox", { name: "Carteira", exact: true }),
    ).toHaveValue("wallet_luna_secondary")
    await expect(
      page.getByRole("combobox", { name: "Tipo de carteira" }),
    ).toHaveValue("metamask")
    await expect(
      page.getByRole("button", { name: "Desconectar carteira" }),
    ).toBeVisible()
  })

  test("exibe pagamento recusado e preserva o carrinho", async ({
    context,
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 1000 })
    await openAuthenticatedCheckout(page, context)
    const review = await connectWalletAndOpenReview(page)

    await setMockScenario(context, "payment-declined")
    await review.getByRole("button", { name: "Confirmar pedido" }).click()

    await expect(page).toHaveURL(/\/orders\/order_[^/]+$/)
    await expect(
      page.getByRole("heading", { name: "Pagamento recusado" }),
    ).toBeVisible()
    await expect(page.getByRole("alert")).toContainText(
      "Nenhum item foi removido do seu carrinho",
    )

    await page.goto("/cart")
    await expect(page.getByText("Genesis Circuit #014")).toBeVisible()
    await expect(
      page.getByRole("group", { name: "Quantidade de Genesis Circuit #014" }),
    ).toContainText("1")
  })

  test("recupera um pedido pendente após reload e confirma pelo polling", async ({
    context,
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 1000 })
    await openAuthenticatedCheckout(page, context, "order-pending")
    const review = await connectWalletAndOpenReview(page)

    await review.getByRole("button", { name: "Confirmar pedido" }).click()
    await expect(page).toHaveURL(/\/orders\/order_[^/]+$/)
    const orderUrl = page.url()

    await expect(
      page.getByRole("region", { name: "Pedido pendente" }),
    ).toBeVisible()
    await expect(
      page.getByRole("heading", { name: "Confirmando seu pedido" }),
    ).toBeVisible()

    await page.reload()

    await expect(page).toHaveURL(orderUrl)
    await expect(
      page.getByRole("region", { name: "Pedido pendente" }),
    ).toBeVisible()

    await setMockScenario(context, "default")
    const receipt = page.getByRole("dialog", {
      name: "Seus NFTs agora estão na sua carteira",
    })

    await expect(receipt).toBeVisible()
    await expect(receipt.getByText("ID da transação")).toBeVisible()
    await expect(page).toHaveURL(orderUrl)
  })

  test("exige nova revisão quando a cotação muda e cria somente um pedido", async ({
    context,
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 1000 })
    await openAuthenticatedCheckout(page, context, "checkout-quote-changed")

    const orderStatuses: number[] = []

    page.on("response", (response) => {
      if (isCreateOrderRequest(response.request())) {
        orderStatuses.push(response.status())
      }
    })

    const firstReview = await connectWalletAndOpenReview(page)

    await expect(
      firstReview.getByText("0,005 ETH", { exact: true }),
    ).toBeVisible()
    await firstReview
      .getByRole("button", { name: "Confirmar pedido" })
      .click()

    await expect(firstReview).toBeHidden()
    await expect(page.getByRole("status")).toHaveText(
      "Os valores mudaram. Revise a compra novamente.",
    )
    await expect.poll(() => orderStatuses).toEqual([409])

    await page.getByRole("button", { name: "Revisar compra" }).click()
    const updatedReview = page.getByRole("dialog", {
      name: "Revise sua compra",
    })

    await expect(updatedReview).toBeVisible()
    await expect(
      updatedReview.getByText("0,006 ETH", { exact: true }),
    ).toBeVisible()
    await updatedReview
      .getByRole("button", { name: "Confirmar pedido" })
      .click()

    await expect(page).toHaveURL(/\/orders\/order_[^/]+$/)
    await expect(
      page.getByRole("dialog", {
        name: "Seus NFTs agora estão na sua carteira",
      }),
    ).toBeVisible()
    await expect.poll(() => orderStatuses).toEqual([409, 201])
  })

  test("bloqueia alterações após timeout e recupera exatamente o mesmo pedido", async ({
    context,
    page,
  }) => {
    test.setTimeout(45_000)
    await page.setViewportSize({ width: 1440, height: 1000 })
    await openAuthenticatedCheckout(page, context, "order-timeout-after-create")

    const orderRequests = observeOrderRequests(page)
    const review = await connectWalletAndOpenReview(page)
    const confirmOrder = review.getByRole("button", {
      name: "Confirmar pedido",
    })

    await confirmOrder.click()
    await expect(review.getByRole("alert")).toHaveText(
      "A resposta demorou mais que o esperado. Tente novamente para recuperar o mesmo pedido.",
      { timeout: 15_000 },
    )
    await expect(confirmOrder).toBeEnabled()

    const createdOrderId = await page.evaluate(() => {
      const storedOrders = localStorage.getItem("kurio_mock_orders_v1")

      if (!storedOrders) return null

      const state = JSON.parse(storedOrders) as {
        ordersByUserId: Record<string, Array<{ id: string }>>
      }

      return state.ordersByUserId["user_luna-rocha"]?.[0]?.id ?? null
    })

    expect(createdOrderId).toMatch(/^order_/)

    await review.getByRole("button", { name: "Voltar" }).click()
    await expect(review).toBeHidden()

    const wallet = page.getByRole("combobox", {
      name: "Carteira",
      exact: true,
    })
    const network = page.getByRole("combobox", { name: "Rede", exact: true })
    const provider = page.getByRole("combobox", {
      name: "Tipo de carteira",
    })

    await network.selectOption("polygon")
    await expect(network).toHaveValue("ethereum")
    await wallet.selectOption("wallet_luna_secondary")
    await expect(wallet).toHaveValue("wallet_luna_primary")
    await provider.selectOption("metamask")
    await expect(provider).toHaveValue("coinbase")
    await page
      .getByRole("textbox", { name: "Nome de exibição" })
      .fill("Outro colecionador")

    await page.getByRole("button", { name: "Revisar compra" }).click()
    await expect(review).toBeVisible()
    await expect(
      review.getByText("Luna Rocha", { exact: true }),
    ).toBeVisible()

    await confirmOrder.click()

    await expect(page).toHaveURL(
      new RegExp(`/orders/${createdOrderId ?? "pedido-ausente"}$`),
    )
    await expect(
      page.getByRole("dialog", {
        name: "Seus NFTs agora estão na sua carteira",
      }),
    ).toBeVisible()
    expect(orderRequests).toHaveLength(2)
    expect(orderRequests[0]?.idempotencyKey).toBeTruthy()
    expect(orderRequests[1]?.idempotencyKey).toBe(
      orderRequests[0]?.idempotencyKey,
    )
    expect(orderRequests[1]?.body).toBe(orderRequests[0]?.body)

    const storedOrderIds = await page.evaluate(() => {
      const storedOrders = localStorage.getItem("kurio_mock_orders_v1")

      if (!storedOrders) return []

      const state = JSON.parse(storedOrders) as {
        ordersByUserId: Record<string, Array<{ id: string }>>
      }

      return (state.ordersByUserId["user_luna-rocha"] ?? []).map(
        (order) => order.id,
      )
    })

    expect(storedOrderIds).toEqual([createdOrderId])
  })
})
