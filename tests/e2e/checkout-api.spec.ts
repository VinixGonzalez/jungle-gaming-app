import { expect, test, type Page } from "@playwright/test"

import { setMockScenario } from "./support/mock-scenario.js"
import { waitForMockService } from "./support/mock-readiness.js"

type CheckoutNetwork = "ethereum" | "polygon" | "solana"
type WalletProvider = "wallet-connect" | "metamask" | "coinbase"

interface CollectorData {
  displayName: string
  username: string
  email: string
  profileName?: string
  secondaryEns?: string
  referralCode?: string
  ensName?: string
  notes?: string
}

interface CartResponse {
  items: Array<{
    quantity: number
    edition: {
      id: string
      availableQuantity: number
    }
  }>
  totals: {
    itemCount: number
    subtotalEth: string
    networkFeeEth: string
    totalEth: string
  }
}

interface CatalogResponse {
  items: Array<{
    id: string
    availableQuantity: number
    version: number
  }>
}

interface NftDetailResponse {
  item: {
    id: string
    version: number
    editions: Array<{
      id: string
      availableQuantity: number
    }>
  }
}

interface Wallet {
  id: string
  label: string
  address: string
  network: CheckoutNetwork
  supportedNetworks: CheckoutNetwork[]
}

interface WalletConnection {
  walletId: string
  provider: WalletProvider
  network: CheckoutNetwork
  connectedAt: string
}

interface WalletsResponse {
  wallets: Wallet[]
  connection: WalletConnection | null
}

interface CheckoutQuote {
  id: string
  revision: number
  collector: CollectorData
  wallet: Wallet
  provider: WalletProvider
  network: CheckoutNetwork
  items: Array<{
    nftId: string
    editionId: string
    quantity: number
    unitPriceEth: string
  }>
  totals: {
    itemCount: number
    subtotalEth: string
    networkFeeEth: string
    totalEth: string
  }
}

interface CreateOrderInput {
  quoteId: string
  quoteRevision: number
  collector: CollectorData
  provider: WalletProvider
}

interface Order {
  id: string
  status: "pending" | "confirmed" | "refused"
  version: number
  receipt: {
    collector: CollectorData
  }
  refusal?: {
    code: string
  }
}

interface BrowserRequestInput {
  path: string
  method?: "GET" | "POST" | "DELETE"
  body?: unknown
  headers?: Record<string, string>
}

interface BrowserResponse<T> {
  status: number
  body: T
}

interface ApiErrorBody {
  error: {
    code: string
  }
}

const users = {
  luna: {
    email: "luna.rocha@kurio.test",
    password: "Kurio@123",
  },
  davi: {
    email: "davi.moura@kurio.test",
    password: "Kurio@456",
  },
}

const lunaCollector = {
  displayName: "Luna Rocha",
  username: "luna.rocha",
  email: "luna.rocha@kurio.test",
  profileName: "Colecionadora Luna",
  ensName: "luna.eth",
} satisfies CollectorData

const daviCollector = {
  displayName: "Davi Moura",
  username: "davi.moura",
  email: "davi.moura@kurio.test",
} satisfies CollectorData

const genesisCartItem = {
  nftId: "nft_genesis_014",
  editionId: "edition_genesis_014_limited",
  quantity: 1,
}

async function requestFromBrowser<T = unknown>(
  page: Page,
  input: BrowserRequestInput,
): Promise<BrowserResponse<T>> {
  return page.evaluate(async ({ path, method = "GET", body, headers }) => {
    const requestHeaders = new Headers(headers)

    if (body !== undefined && !requestHeaders.has("Content-Type")) {
      requestHeaders.set("Content-Type", "application/json")
    }

    const response = await fetch(path, {
      method,
      headers: requestHeaders,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
    const responseText = await response.text()

    return {
      status: response.status,
      body: responseText ? JSON.parse(responseText) : null,
    }
  }, input) as Promise<BrowserResponse<T>>
}

async function login(
  page: Page,
  credentials: (typeof users)[keyof typeof users],
) {
  const response = await requestFromBrowser(page, {
    path: "/api/auth/login",
    method: "POST",
    body: credentials,
  })

  expect(response.status).toBe(200)
}

async function logout(page: Page) {
  const response = await requestFromBrowser(page, {
    path: "/api/auth/session",
    method: "DELETE",
  })

  expect(response.status).toBe(204)
}

async function seedCart(page: Page) {
  const response = await requestFromBrowser<CartResponse>(page, {
    path: "/api/cart/items",
    method: "POST",
    body: genesisCartItem,
  })

  expect(response.status).toBe(201)

  return response.body
}

async function connectWallet(
  page: Page,
  walletId: string,
  network: CheckoutNetwork = "ethereum",
) {
  const response = await requestFromBrowser<WalletConnection>(page, {
    path: `/api/wallets/${walletId}/connect`,
    method: "POST",
    body: { provider: "metamask", network },
  })

  expect(response.status).toBe(200)

  return response.body
}

async function createQuote(
  page: Page,
  walletId: string,
  network: CheckoutNetwork = "ethereum",
  collector: CollectorData = lunaCollector,
) {
  const response = await requestFromBrowser<CheckoutQuote>(page, {
    path: "/api/checkout/quotes",
    method: "POST",
    body: {
      walletId,
      provider: "metamask",
      network,
      collector,
    },
  })

  expect(response.status).toBe(201)

  return response.body
}

async function prepareLunaQuote(page: Page) {
  await login(page, users.luna)
  await seedCart(page)

  const walletsResponse = await requestFromBrowser<WalletsResponse>(page, {
    path: "/api/wallets",
  })

  expect(walletsResponse.status).toBe(200)

  const wallet = walletsResponse.body.wallets[0]

  expect(wallet).toBeDefined()
  await connectWallet(page, wallet.id)

  return createQuote(page, wallet.id)
}

async function expireCheckoutQuote(page: Page, quoteId: string) {
  await page.evaluate(
    ({ storageKey, userId, quoteId: selectedQuoteId }) => {
      const serializedState = localStorage.getItem(storageKey)

      if (!serializedState) throw new Error("Checkout mock state not found.")

      const state = JSON.parse(serializedState) as {
        usersById: Record<
          string,
          {
            quotesById: Record<
              string,
              { quote: { expiresAt: string } }
            >
          }
        >
      }
      const storedQuote =
        state.usersById[userId]?.quotesById[selectedQuoteId]

      if (!storedQuote) throw new Error("Checkout quote not found.")

      storedQuote.quote.expiresAt = new Date(0).toISOString()
      localStorage.setItem(storageKey, JSON.stringify(state))
    },
    {
      storageKey: "kurio_mock_checkout_v1",
      userId: "user_luna-rocha",
      quoteId,
    },
  )
}

function createOrderInput(quote: CheckoutQuote): CreateOrderInput {
  return {
    quoteId: quote.id,
    quoteRevision: quote.revision,
    collector: quote.collector,
    provider: quote.provider,
  }
}

async function createOrder(
  page: Page,
  quote: CheckoutQuote,
  idempotencyKey: string,
  input: CreateOrderInput = createOrderInput(quote),
) {
  return requestFromBrowser<Order>(page, {
    path: "/api/orders",
    method: "POST",
    headers: { "Idempotency-Key": idempotencyKey },
    body: input,
  })
}

test.describe("API REST de checkout", () => {
  test.beforeEach(async ({ context, page }) => {
    await setMockScenario(context, "default")
    await page.goto("/")
    await expect(
      page.getByRole("region", { name: "Mercado de NFTs" }),
    ).toHaveAttribute("aria-busy", "false")
    await waitForMockService(page)
  })

  test("protege carteiras, cotação e pedidos sem uma sessão", async ({ page }) => {
    const privateRequests: BrowserRequestInput[] = [
      { path: "/api/wallets" },
      {
        path: "/api/wallets/wallet_luna_primary/connect",
        method: "POST",
        body: { provider: "metamask", network: "ethereum" },
      },
      { path: "/api/wallets/connection", method: "DELETE" },
      {
        path: "/api/checkout/quotes",
        method: "POST",
        body: {
          walletId: "wallet_luna_primary",
          provider: "metamask",
          network: "ethereum",
          collector: lunaCollector,
        },
      },
      {
        path: "/api/orders",
        method: "POST",
        headers: { "Idempotency-Key": "anonymous-attempt" },
        body: {
          quoteId: "quote_private",
          quoteRevision: 1,
          collector: lunaCollector,
          provider: "metamask",
        },
      },
      { path: "/api/orders/order_private" },
    ]

    for (const request of privateRequests) {
      await test.step(`${request.method ?? "GET"} ${request.path}`, async () => {
        const response = await requestFromBrowser<ApiErrorBody>(page, request)

        expect(response.status).toBe(401)
        expect(response.body).toMatchObject({
          error: { code: "AUTH_REQUIRED" },
        })
      })
    }
  })

  test("autentica, popula o carrinho, conecta a carteira e cria a cotação", async ({
    page,
  }) => {
    await login(page, users.luna)

    const cart = await seedCart(page)

    expect(cart).toMatchObject({
      totals: {
        itemCount: 1,
        subtotalEth: "0.95",
        networkFeeEth: "0.005",
        totalEth: "0.955",
      },
    })

    const walletsResponse = await requestFromBrowser<WalletsResponse>(page, {
      path: "/api/wallets",
    })

    expect(walletsResponse.status).toBe(200)
    expect(walletsResponse.body).toMatchObject({
      connection: null,
      wallets: [
        {
          id: "wallet_luna_primary",
          network: "ethereum",
          supportedNetworks: ["ethereum", "polygon"],
        },
        {
          id: "wallet_luna_secondary",
          network: "polygon",
          supportedNetworks: ["polygon", "ethereum"],
        },
      ],
    })

    const connection = await connectWallet(
      page,
      "wallet_luna_primary",
      "polygon",
    )

    expect(connection).toMatchObject({
      walletId: "wallet_luna_primary",
      provider: "metamask",
      network: "polygon",
    })

    const quote = await createQuote(
      page,
      "wallet_luna_primary",
      "polygon",
    )

    expect(quote).toMatchObject({
      revision: 1,
      collector: lunaCollector,
      provider: "metamask",
      network: "polygon",
      items: [
        {
          nftId: genesisCartItem.nftId,
          editionId: genesisCartItem.editionId,
          quantity: 1,
          unitPriceEth: "0.95",
        },
      ],
      totals: {
        itemCount: 1,
        subtotalEth: "0.95",
        networkFeeEth: "0.005",
        totalEth: "0.955",
      },
    })
  })

  test("rejeita uma rede que a carteira nao suporta", async ({ page }) => {
    await login(page, users.luna)
    await seedCart(page)

    const connectionResponse = await requestFromBrowser<ApiErrorBody>(page, {
      path: "/api/wallets/wallet_luna_primary/connect",
      method: "POST",
      body: { provider: "metamask", network: "solana" },
    })

    expect(connectionResponse.status).toBe(409)
    expect(connectionResponse.body).toMatchObject({
      error: { code: "WALLET_NETWORK_UNSUPPORTED" },
    })

    const quoteResponse = await requestFromBrowser<ApiErrorBody>(page, {
      path: "/api/checkout/quotes",
      method: "POST",
      body: {
        walletId: "wallet_luna_primary",
        provider: "metamask",
        network: "solana",
        collector: lunaCollector,
      },
    })

    expect(quoteResponse.status).toBe(409)
    expect(quoteResponse.body).toMatchObject({
      error: { code: "WALLET_NETWORK_UNSUPPORTED" },
    })
  })

  test("rejeita a criacao do pedido quando a cotacao expirou", async ({
    page,
  }) => {
    const quote = await prepareLunaQuote(page)

    await expireCheckoutQuote(page, quote.id)

    const response = await createOrder(
      page,
      quote,
      "checkout-api-expired-quote",
    )

    expect(response.status).toBe(410)
    expect(response.body).toMatchObject({
      error: { code: "CHECKOUT_QUOTE_EXPIRED" },
    })
  })

  test("impede usar a cotacao depois de desconectar a carteira", async ({
    page,
  }) => {
    const quote = await prepareLunaQuote(page)
    const disconnectResponse = await requestFromBrowser(page, {
      path: "/api/wallets/connection",
      method: "DELETE",
    })

    expect(disconnectResponse.status).toBe(204)

    const response = await createOrder(
      page,
      quote,
      "checkout-api-disconnected-wallet",
    )

    expect(response.status).toBe(409)
    expect(response.body).toMatchObject({
      error: { code: "WALLET_CONNECTION_REQUIRED" },
    })
  })

  test("recupera o mesmo pedido com a mesma chave e rejeita conteúdo diferente", async ({
    page,
  }) => {
    const quote = await prepareLunaQuote(page)
    const idempotencyKey = "checkout-api-same-attempt"
    const orderInput = createOrderInput(quote)

    const firstResponse = await createOrder(
      page,
      quote,
      idempotencyKey,
      orderInput,
    )
    const repeatedResponse = await createOrder(
      page,
      quote,
      idempotencyKey,
      orderInput,
    )

    expect(firstResponse.status).toBe(201)
    expect(firstResponse.body.status).toBe("pending")
    expect(repeatedResponse.status).toBe(200)
    expect(repeatedResponse.body).toEqual(firstResponse.body)

    const conflictingResponse = await requestFromBrowser<ApiErrorBody>(page, {
      path: "/api/orders",
      method: "POST",
      headers: { "Idempotency-Key": idempotencyKey },
      body: {
        ...orderInput,
        collector: {
          ...orderInput.collector,
          notes: "Conteúdo diferente na mesma tentativa.",
        },
      },
    })

    expect(conflictingResponse.status).toBe(409)
    expect(conflictingResponse.body).toMatchObject({
      error: { code: "IDEMPOTENCY_KEY_REUSED" },
    })
  })

  test("exige nova cotação quando os valores mudam", async ({ context, page }) => {
    await setMockScenario(context, "checkout-quote-changed")

    const quote = await prepareLunaQuote(page)

    expect(quote.totals.networkFeeEth).toBe("0.005")

    const response = await requestFromBrowser<ApiErrorBody>(page, {
      path: "/api/orders",
      method: "POST",
      headers: { "Idempotency-Key": "checkout-api-changed-quote" },
      body: createOrderInput(quote),
    })

    expect(response.status).toBe(409)
    expect(response.body).toMatchObject({
      error: { code: "CHECKOUT_QUOTE_CHANGED" },
    })

    const nextQuote = await createQuote(page, quote.wallet.id)

    expect(nextQuote.id).not.toBe(quote.id)
    expect(nextQuote.totals).toMatchObject({
      networkFeeEth: "0.006",
      totalEth: "0.956",
    })
  })

  test("rejeita item indisponível sem criar nem reservar a tentativa", async ({
    context,
    page,
  }) => {
    await setMockScenario(context, "checkout-item-unavailable")

    const quote = await prepareLunaQuote(page)
    const idempotencyKey = "checkout-api-unavailable-item"
    const response = await requestFromBrowser<ApiErrorBody>(page, {
      path: "/api/orders",
      method: "POST",
      headers: { "Idempotency-Key": idempotencyKey },
      body: createOrderInput(quote),
    })

    expect(response.status).toBe(409)
    expect(response.body).toMatchObject({
      error: { code: "CHECKOUT_ITEM_UNAVAILABLE" },
    })

    const cartResponse = await requestFromBrowser<CartResponse>(page, {
      path: "/api/cart",
    })

    expect(cartResponse.status).toBe(200)
    expect(cartResponse.body.totals.itemCount).toBe(1)

    await setMockScenario(context, "default")

    const freshQuote = await createQuote(page, quote.wallet.id)
    const retryResponse = await createOrder(
      page,
      freshQuote,
      idempotencyKey,
    )

    expect(retryResponse.status).toBe(201)
    expect(retryResponse.body.status).toBe("pending")
  })

  test("mantém o pedido pendente e depois registra o pagamento recusado", async ({
    context,
    page,
  }) => {
    const quote = await prepareLunaQuote(page)
    const createResponse = await createOrder(
      page,
      quote,
      "checkout-api-payment-refused",
    )

    expect(createResponse.status).toBe(201)

    await setMockScenario(context, "order-pending")

    const pendingResponse = await requestFromBrowser<Order>(page, {
      path: `/api/orders/${createResponse.body.id}`,
    })

    expect(pendingResponse.status).toBe(200)
    expect(pendingResponse.body).toMatchObject({
      id: createResponse.body.id,
      status: "pending",
      version: 1,
    })

    await setMockScenario(context, "payment-declined")

    const refusedResponse = await requestFromBrowser<Order>(page, {
      path: `/api/orders/${createResponse.body.id}`,
    })

    expect(refusedResponse.status).toBe(200)
    expect(refusedResponse.body).toMatchObject({
      id: createResponse.body.id,
      status: "refused",
      version: 2,
      refusal: { code: "PAYMENT_REFUSED" },
    })

    await setMockScenario(context, "default")

    const terminalResponse = await requestFromBrowser<Order>(page, {
      path: `/api/orders/${createResponse.body.id}`,
    })
    const cartResponse = await requestFromBrowser<CartResponse>(page, {
      path: "/api/cart",
    })

    expect(terminalResponse.body).toEqual(refusedResponse.body)
    expect(cartResponse.body.totals.itemCount).toBe(1)
  })

  test("desconta o estoque uma vez e recusa uma confirmação concorrente sem consumir o carrinho", async ({
    page,
  }) => {
    await login(page, users.luna)

    const lunaCartResponse = await requestFromBrowser<CartResponse>(page, {
      path: "/api/cart/items",
      method: "POST",
      body: { ...genesisCartItem, quantity: 6 },
    })

    expect(lunaCartResponse.status).toBe(201)

    await connectWallet(page, "wallet_luna_primary")

    const lunaQuote = await createQuote(page, "wallet_luna_primary")
    const lunaOrderResponse = await createOrder(
      page,
      lunaQuote,
      "inventory-luna-order",
    )

    expect(lunaOrderResponse.status).toBe(201)

    await logout(page)
    await login(page, users.davi)

    const daviCartResponse = await requestFromBrowser<CartResponse>(page, {
      path: "/api/cart/items",
      method: "POST",
      body: genesisCartItem,
    })

    expect(daviCartResponse.status).toBe(201)

    await connectWallet(page, "wallet_davi_secondary")

    const daviQuote = await createQuote(
      page,
      "wallet_davi_secondary",
      "ethereum",
      daviCollector,
    )
    const daviOrderResponse = await createOrder(
      page,
      daviQuote,
      "inventory-davi-order",
    )

    expect(daviOrderResponse.status).toBe(201)

    const confirmedDaviOrder = await requestFromBrowser<Order>(page, {
      path: `/api/orders/${daviOrderResponse.body.id}`,
    })

    expect(confirmedDaviOrder.body.status).toBe("confirmed")

    const catalogAfterConfirmation =
      await requestFromBrowser<CatalogResponse>(page, {
        path: "/api/nfts?pageSize=50",
      })
    const detailAfterConfirmation =
      await requestFromBrowser<NftDetailResponse>(page, {
        path: "/api/nfts/genesis-circuit-014",
      })
    const catalogItem = catalogAfterConfirmation.body.items.find(
      (item) => item.id === genesisCartItem.nftId,
    )
    const detailEdition = detailAfterConfirmation.body.item.editions.find(
      (edition) => edition.id === genesisCartItem.editionId,
    )

    expect(catalogItem).toMatchObject({
      availableQuantity: 6,
      version: 2,
    })
    expect(detailEdition?.availableQuantity).toBe(5)
    expect(detailAfterConfirmation.body.item.version).toBe(2)

    const repeatedDaviOrder = await requestFromBrowser<Order>(page, {
      path: `/api/orders/${daviOrderResponse.body.id}`,
    })
    const detailAfterRepeatedRead =
      await requestFromBrowser<NftDetailResponse>(page, {
        path: "/api/nfts/genesis-circuit-014",
      })

    expect(repeatedDaviOrder.body).toEqual(confirmedDaviOrder.body)
    expect(
      detailAfterRepeatedRead.body.item.editions.find(
        (edition) => edition.id === genesisCartItem.editionId,
      )?.availableQuantity,
    ).toBe(5)

    await logout(page)
    await login(page, users.luna)

    const refusedLunaOrder = await requestFromBrowser<Order>(page, {
      path: `/api/orders/${lunaOrderResponse.body.id}`,
    })
    const preservedLunaCart = await requestFromBrowser<CartResponse>(page, {
      path: "/api/cart",
    })

    expect(refusedLunaOrder.body).toMatchObject({
      status: "refused",
      refusal: { code: "CHECKOUT_ITEM_UNAVAILABLE" },
    })
    expect(preservedLunaCart.body).toMatchObject({
      items: [
        {
          quantity: 5,
          edition: {
            id: genesisCartItem.editionId,
            availableQuantity: 5,
          },
        },
      ],
      totals: { itemCount: 5 },
    })
  })

  test("isola o pedido entre Luna e Davi", async ({ context, page }) => {
    const quote = await prepareLunaQuote(page)
    const createResponse = await createOrder(
      page,
      quote,
      "checkout-api-user-isolation",
    )

    expect(createResponse.status).toBe(201)

    await setMockScenario(context, "order-pending")
    await logout(page)
    await login(page, users.davi)

    const daviOrderResponse = await requestFromBrowser<ApiErrorBody>(page, {
      path: `/api/orders/${createResponse.body.id}`,
    })
    const daviWalletsResponse = await requestFromBrowser<WalletsResponse>(page, {
      path: "/api/wallets",
    })

    expect(daviOrderResponse.status).toBe(404)
    expect(daviOrderResponse.body).toMatchObject({
      error: { code: "ORDER_NOT_FOUND" },
    })
    expect(daviWalletsResponse.body.wallets.map((wallet) => wallet.id)).toEqual([
      "wallet_davi_primary",
      "wallet_davi_secondary",
    ])

    await logout(page)
    await login(page, users.luna)

    const lunaOrderResponse = await requestFromBrowser<Order>(page, {
      path: `/api/orders/${createResponse.body.id}`,
    })

    expect(lunaOrderResponse.status).toBe(200)
    expect(lunaOrderResponse.body).toMatchObject({
      id: createResponse.body.id,
      status: "pending",
      receipt: {
        collector: { email: users.luna.email },
      },
    })
  })
})
