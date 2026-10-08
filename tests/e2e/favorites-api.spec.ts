import { expect, test, type Page } from "@playwright/test"

import { setMockScenario } from "./support/mock-scenario.js"
import { waitForMockService } from "./support/mock-readiness.js"

interface BrowserRequestInput {
  body?: unknown
  method?: "DELETE" | "GET" | "POST" | "PUT"
  path: string
}

interface BrowserResponse<T> {
  body: T
  status: number
}

interface FavoriteItem {
  id: string
  name: string
  slug: string
}

interface FavoritesResponse {
  ids: string[]
  items: FavoriteItem[]
}

interface ApiErrorBody {
  error: { code: string }
}

const luna = {
  email: "luna.rocha@kurio.test",
  password: "Kurio@123",
}

const davi = {
  email: "davi.moura@kurio.test",
  password: "Kurio@456",
}

async function requestFromBrowser<T = unknown>(
  page: Page,
  input: BrowserRequestInput,
): Promise<BrowserResponse<T>> {
  return page.evaluate(async ({ body, method = "GET", path }) => {
    const response = await fetch(path, {
      method,
      headers:
        body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
    const text = await response.text()

    return {
      body: text ? JSON.parse(text) : null,
      status: response.status,
    }
  }, input) as Promise<BrowserResponse<T>>
}

async function openApp(page: Page) {
  await page.goto("/")
  await expect(
    page.getByRole("region", { name: "Mercado de NFTs" }),
  ).toHaveAttribute("aria-busy", "false")
  await waitForMockService(page)
}

async function login(
  page: Page,
  credentials: { email: string; password: string },
) {
  const response = await requestFromBrowser(page, {
    body: credentials,
    method: "POST",
    path: "/api/auth/login",
  })

  expect(response.status).toBe(200)
}

async function logout(page: Page) {
  const response = await requestFromBrowser(page, {
    method: "DELETE",
    path: "/api/auth/session",
  })

  expect(response.status).toBe(204)
}

async function register(
  page: Page,
  account: { email: string; password: string; username: string },
) {
  const response = await requestFromBrowser(page, {
    body: account,
    method: "POST",
    path: "/api/auth/register",
  })

  expect(response.status).toBe(201)
}

async function getFavorites(page: Page) {
  const response = await requestFromBrowser<FavoritesResponse>(page, {
    path: "/api/favorites",
  })

  expect(response.status).toBe(200)

  return response.body
}

test.describe("API REST de favoritos", () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page)
  })

  test("protege consulta, inclusão e remoção sem uma sessão", async ({
    page,
  }) => {
    for (const request of [
      { path: "/api/favorites" },
      {
        method: "PUT" as const,
        path: "/api/favorites/nft_rift_runner_103",
      },
      {
        method: "DELETE" as const,
        path: "/api/favorites/nft_rift_runner_103",
      },
    ]) {
      const response = await requestFromBrowser<ApiErrorBody>(page, request)

      expect(response.status).toBe(401)
      expect(response.body).toMatchObject({
        error: { code: "AUTH_REQUIRED" },
      })
    }
  })

  test("inclui, remove e persiste favoritos de forma idempotente", async ({
    page,
  }) => {
    await login(page, luna)

    const initialFavorites = await getFavorites(page)

    expect(initialFavorites.ids).toEqual([
      "nft_genesis_014",
      "nft_quiet_orbit_028",
    ])

    const createResponse = await requestFromBrowser<FavoritesResponse>(page, {
      method: "PUT",
      path: "/api/favorites/nft_rift_runner_103",
    })

    expect(createResponse.status).toBe(201)
    expect(createResponse.body.ids).toContain("nft_rift_runner_103")

    const repeatedResponse = await requestFromBrowser<FavoritesResponse>(page, {
      method: "PUT",
      path: "/api/favorites/nft_rift_runner_103",
    })

    expect(repeatedResponse.status).toBe(200)
    expect(
      repeatedResponse.body.ids.filter(
        (favoriteId) => favoriteId === "nft_rift_runner_103",
      ),
    ).toHaveLength(1)

    await page.reload()
    await expect(
      page.getByRole("region", { name: "Mercado de NFTs" }),
    ).toHaveAttribute("aria-busy", "false")
    expect((await getFavorites(page)).ids).toContain("nft_rift_runner_103")

    const removeResponse = await requestFromBrowser<FavoritesResponse>(page, {
      method: "DELETE",
      path: "/api/favorites/nft_rift_runner_103",
    })

    expect(removeResponse.status).toBe(200)
    expect(removeResponse.body.ids).not.toContain("nft_rift_runner_103")
    expect((await getFavorites(page)).ids).not.toContain("nft_rift_runner_103")
  })

  test("rejeita NFT inexistente e preserva o estado conhecido", async ({
    page,
  }) => {
    await login(page, luna)
    const initialFavorites = await getFavorites(page)
    const response = await requestFromBrowser<ApiErrorBody>(page, {
      method: "PUT",
      path: "/api/favorites/nft_inexistente",
    })

    expect(response.status).toBe(404)
    expect(response.body).toMatchObject({ error: { code: "NFT_NOT_FOUND" } })
    expect(await getFavorites(page)).toEqual(initialFavorites)
  })

  test("mantém favoritos isolados entre usuários", async ({ page }) => {
    await login(page, luna)
    await requestFromBrowser(page, {
      method: "PUT",
      path: "/api/favorites/nft_rift_runner_103",
    })
    await logout(page)
    await login(page, davi)

    expect((await getFavorites(page)).ids).not.toContain(
      "nft_rift_runner_103",
    )

    await logout(page)
    await login(page, luna)
    expect((await getFavorites(page)).ids).toContain("nft_rift_runner_103")
  })

  test("inicia uma conta nova com a lista vazia", async ({ page }) => {
    await register(page, {
      email: "nova.colecionadora@kurio.test",
      password: "Kurio@789",
      username: "nova.colecionadora",
    })

    expect(await getFavorites(page)).toEqual({ ids: [], items: [] })
  })

  test("não altera o estado quando a mutation falha", async ({
    context,
    page,
  }) => {
    await login(page, luna)
    const initialFavorites = await getFavorites(page)
    await setMockScenario(context, "favorite-mutation-error")

    const response = await requestFromBrowser<ApiErrorBody>(page, {
      method: "PUT",
      path: "/api/favorites/nft_rift_runner_103",
    })

    expect(response.status).toBe(503)
    expect(response.body).toMatchObject({
      error: { code: "FAVORITE_MUTATION_FAILED" },
    })

    await setMockScenario(context, "default")
    expect(await getFavorites(page)).toEqual(initialFavorites)
  })
})
