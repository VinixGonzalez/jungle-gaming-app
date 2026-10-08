import { expect, test, type Page } from "@playwright/test"

import { mockScenarioCookieName } from "../../src/shared/mocks/index.js"
import { waitForMockService } from "./support/mock-readiness.js"

interface BrowserFetchInput {
  path: string
  method?: "GET" | "POST" | "DELETE"
  body?: unknown
}

interface BrowserFetchResult {
  status: number
  body: unknown
}

const validCredentials = {
  email: "luna.rocha@kurio.test",
  password: "Kurio@123",
}

async function fetchFromBrowser(
  page: Page,
  input: BrowserFetchInput,
): Promise<BrowserFetchResult> {
  return page.evaluate(async ({ path, method = "GET", body }) => {
    const response = await fetch(path, {
      method,
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    })

    if (response.status === 204) {
      return { status: response.status, body: null }
    }

    return { status: response.status, body: await response.json() }
  }, input)
}

async function openApp(page: Page) {
  await page.goto("/")

  await waitForMockApi(page)
}

async function waitForMockApi(page: Page) {
  await waitForMockService(page)
  await expect(
    page.getByRole("region", { name: "Mercado de NFTs" }),
  ).toHaveAttribute("aria-busy", "false")
}

test.describe("API de autenticação", () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page)
  })

  test("autentica credenciais válidas e mantém a sessão após recarregar", async ({
    page,
  }) => {
    const loginResponse = await fetchFromBrowser(page, {
      path: "/api/auth/login",
      method: "POST",
      body: validCredentials,
    })

    expect(loginResponse.status).toBe(200)
    expect(loginResponse.body).toMatchObject({
      user: {
        id: "user_luna-rocha",
        username: "luna.rocha",
        email: "luna.rocha@kurio.test",
        avatarUrl: null,
      },
      expiresAt: expect.any(String),
    })

    await page.reload()
    await waitForMockApi(page)

    const sessionResponse = await fetchFromBrowser(page, {
      path: "/api/auth/session",
    })

    expect(sessionResponse.status).toBe(200)
    expect(sessionResponse.body).toEqual(loginResponse.body)
  })

  test("encerra a sessão e passa a responder que a autenticação é necessária", async ({
    page,
  }) => {
    const loginResponse = await fetchFromBrowser(page, {
      path: "/api/auth/login",
      method: "POST",
      body: validCredentials,
    })
    expect(loginResponse.status).toBe(200)

    const logoutResponse = await fetchFromBrowser(page, {
      path: "/api/auth/session",
      method: "DELETE",
    })
    expect(logoutResponse).toEqual({ status: 204, body: null })

    const sessionResponse = await fetchFromBrowser(page, {
      path: "/api/auth/session",
    })
    expect(sessionResponse.status).toBe(401)
    expect(sessionResponse.body).toMatchObject({
      error: { code: "AUTH_REQUIRED" },
    })
  })

  test("rejeita credenciais inválidas", async ({ page }) => {
    const response = await fetchFromBrowser(page, {
      path: "/api/auth/login",
      method: "POST",
      body: { ...validCredentials, password: "Senha@Incorreta" },
    })

    expect(response.status).toBe(401)
    expect(response.body).toMatchObject({
      error: { code: "INVALID_CREDENTIALS" },
    })
  })

  test("cadastra uma conta, normaliza o e-mail e mantém a sessão após recarregar", async ({
    page,
  }) => {
    const registerResponse = await fetchFromBrowser(page, {
      path: "/api/auth/register",
      method: "POST",
      body: {
        username: "nova.colecionadora",
        email: "  NOVA.COLECIONADORA@KURIO.TEST  ",
        password: "Segura@123",
      },
    })

    expect(registerResponse.status).toBe(201)
    expect(registerResponse.body).toMatchObject({
      user: {
        username: "nova.colecionadora",
        email: "nova.colecionadora@kurio.test",
        avatarUrl: null,
      },
      expiresAt: expect.any(String),
    })

    await page.reload()
    await waitForMockApi(page)

    const sessionResponse = await fetchFromBrowser(page, {
      path: "/api/auth/session",
    })
    expect(sessionResponse.status).toBe(200)
    expect(sessionResponse.body).toEqual(registerResponse.body)
  })

  test("informa separadamente quando o e-mail já está cadastrado", async ({
    page,
  }) => {
    const response = await fetchFromBrowser(page, {
      path: "/api/auth/register",
      method: "POST",
      body: {
        username: "outra.pessoa",
        email: "LUNA.ROCHA@KURIO.TEST",
        password: "Segura@123",
      },
    })

    expect(response.status).toBe(409)
    expect(response.body).toMatchObject({
      error: {
        code: "EMAIL_ALREADY_EXISTS",
        fieldErrors: { email: expect.any(Array) },
      },
    })
  })

  test("informa separadamente quando o nome de usuário já está cadastrado", async ({
    page,
  }) => {
    const response = await fetchFromBrowser(page, {
      path: "/api/auth/register",
      method: "POST",
      body: {
        username: "LUNA.ROCHA",
        email: "email.unico@kurio.test",
        password: "Segura@123",
      },
    })

    expect(response.status).toBe(409)
    expect(response.body).toMatchObject({
      error: {
        code: "USERNAME_ALREADY_EXISTS",
        fieldErrors: { username: expect.any(Array) },
      },
    })
  })

  test("retorna os erros dos campos quando o corpo da requisição é inválido", async ({
    page,
  }) => {
    const response = await fetchFromBrowser(page, {
      path: "/api/auth/register",
      method: "POST",
      body: {
        username: "x",
        email: "email-invalido",
        password: "curta",
      },
    })

    expect(response.status).toBe(400)
    expect(response.body).toMatchObject({
      error: {
        code: "INVALID_AUTH_REQUEST",
        fieldErrors: {
          username: expect.any(Array),
          email: expect.any(Array),
          password: expect.any(Array),
        },
      },
    })
  })

  test("informa quando a sessão expirou no cenário controlado pelo cookie", async ({
    context,
    page,
  }) => {
    const loginResponse = await fetchFromBrowser(page, {
      path: "/api/auth/login",
      method: "POST",
      body: validCredentials,
    })
    expect(loginResponse.status).toBe(200)

    await context.addCookies([
      {
        name: mockScenarioCookieName,
        value: "auth-session-expired",
        url: "http://127.0.0.1:4173",
      },
    ])

    const response = await fetchFromBrowser(page, {
      path: "/api/auth/session",
    })

    expect(response.status).toBe(401)
    expect(response.body).toMatchObject({
      error: { code: "SESSION_EXPIRED" },
    })

    await context.clearCookies({ name: mockScenarioCookieName })

    const missingSessionResponse = await fetchFromBrowser(page, {
      path: "/api/auth/session",
    })
    expect(missingSessionResponse.status).toBe(401)
    expect(missingSessionResponse.body).toMatchObject({
      error: { code: "AUTH_REQUIRED" },
    })
  })
})
