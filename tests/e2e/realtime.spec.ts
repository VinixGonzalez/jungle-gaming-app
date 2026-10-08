import { expect, test, type Page } from "@playwright/test"

import { seedCart } from "./support/cart.js"
import { waitForMockService } from "./support/mock-readiness.js"
import { setMockScenario } from "./support/mock-scenario.js"

const credentials = {
  email: "luna.rocha@kurio.test",
  password: "Kurio@123",
}

const realtimeCartItem = {
  editionId: "edition_genesis_014_limited",
  nftId: "nft_genesis_014",
  quantity: 3,
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

async function prepareAuthenticatedCart(page: Page) {
  await page.goto("/")
  await waitForHome(page)
  await loginThroughApi(page)
  await seedCart(page, [realtimeCartItem])
}

async function connectWalletAndOpenReview(page: Page) {
  await page.getByRole("button", { name: "Conectar carteira" }).click()
  await expect(page.getByRole("status")).toHaveText(
    "Carteira conectada com sucesso.",
  )
  await page.getByRole("button", { name: "Revisar compra" }).click()

  const review = page.getByRole("dialog", { name: "Revise sua compra" })

  await expect(review).toBeVisible()

  return review
}

test.describe("tempo real com Socket.IO", () => {
  test("atualiza preço, disponibilidade e resumo do carrinho", async ({
    context,
    page,
  }) => {
    await setMockScenario(context, "default")
    await prepareAuthenticatedCart(page)
    await setMockScenario(context, "realtime-nft-update")
    await page.goto("/cart")

    const itemRow = page.getByRole("row").filter({
      hasText: "Genesis Circuit #014",
    })

    await expect(itemRow.getByText("0,95 ETH", { exact: true })).toBeVisible()
    await expect(
      itemRow.getByLabel("Quantidade selecionada"),
    ).toHaveText("3")

    await expect(
      page.getByRole("main").getByText(
        "Preço e disponibilidade de Genesis Circuit #014 foram atualizados em tempo real.",
        { exact: true },
      ),
    ).toBeVisible()
    await expect(itemRow.getByText("1,05 ETH", { exact: true })).toBeVisible()
    await expect(
      itemRow.getByLabel("Quantidade selecionada"),
    ).toHaveText("2")
    await expect(page.getByText("2,105 ETH", { exact: true })).toBeVisible()

    await page.reload()
    await expect(itemRow.getByText("1,05 ETH", { exact: true })).toBeVisible()
    await expect(
      itemRow.getByLabel("Quantidade selecionada"),
    ).toHaveText("2")
  })

  test("descarta evento duplicado e versão antiga sem regredir o catálogo", async ({
    context,
    page,
  }) => {
    let catalogRequests = 0

    page.on("request", (request) => {
      const url = new URL(request.url())

      if (request.method() === "GET" && url.pathname === "/api/nfts") {
        catalogRequests += 1
      }
    })

    await setMockScenario(context, "realtime-nft-event-ordering")
    await page.goto("/?q=Genesis")
    await waitForHome(page)
    const requestsBeforeUpdate = catalogRequests

    await expect(
      page.getByText(
        "Preço e disponibilidade de Genesis Circuit #014 foram atualizados em tempo real.",
        { exact: true },
      ),
    ).toBeAttached()
    const updatedNft = page.getByRole("article").filter({
      hasText: "Genesis Circuit #014",
    })

    await expect(updatedNft.getByText("0,99 ETH", { exact: true })).toBeVisible()
    await page.waitForTimeout(500)

    expect(catalogRequests - requestsBeforeUpdate).toBe(1)
    await expect(updatedNft.getByText("0,99 ETH", { exact: true })).toBeVisible()
  })

  test("invalida a revisão quando o valor muda antes da confirmação", async ({
    context,
    page,
  }) => {
    await setMockScenario(context, "default")
    await prepareAuthenticatedCart(page)
    await setMockScenario(context, "realtime-nft-update")
    await page.goto("/checkout")

    const review = await connectWalletAndOpenReview(page)

    await expect(review.getByText("2,855 ETH", { exact: true })).toBeVisible()
    await expect(review).toBeHidden()
    await expect(page.getByRole("status")).toContainText(
      "O preço ou a disponibilidade de um item mudou em tempo real.",
    )
    await expect(page.getByText("2,105 ETH", { exact: true })).toBeVisible()

    await page.getByRole("button", { name: "Revisar compra" }).click()
    await expect(
      page
        .getByRole("dialog", { name: "Revise sua compra" })
        .getByText("2,105 ETH", { exact: true }),
    ).toBeVisible()
  })

  test("retoma um pedido pendente após a interrupção do socket", async ({
    context,
    page,
  }) => {
    await setMockScenario(context, "default")
    await prepareAuthenticatedCart(page)
    await page.goto("/checkout")
    const review = await connectWalletAndOpenReview(page)

    await setMockScenario(context, "realtime-order-reconnect")
    await review.getByRole("button", { name: "Confirmar pedido" }).click()

    await expect(page).toHaveURL(/\/orders\/order_[^/]+$/)
    await expect(
      page.getByText("Pagamento confirmado em tempo real.", { exact: true }),
    ).toBeAttached()
    await expect(
      page.getByRole("dialog", {
        name: "Seus NFTs agora estão na sua carteira",
      }),
    ).toBeVisible()

    await page.reload()
    await expect(
      page.getByRole("dialog", {
        name: "Seus NFTs agora estão na sua carteira",
      }),
    ).toBeVisible()
  })
})
