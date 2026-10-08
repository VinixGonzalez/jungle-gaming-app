import { expect, test, type Page } from "@playwright/test"

import { waitForMockService } from "./support/mock-readiness.js"

type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE"
type WalletNetwork = "ethereum" | "polygon" | "solana"
type WalletRole = "primary" | "secondary"

interface BrowserRequestInput {
  path: string
  method?: HttpMethod
  body?: unknown
}

interface BrowserResponse<T> {
  status: number
  body: T
}

interface ApiErrorBody {
  error: {
    code: string
    fieldErrors?: Record<string, string[]>
  }
}

interface Profile {
  id: string
  displayName: string
  username: string
  email: string
  ensName: string | null
  avatarUrl: string | null
  walletAlias: string | null
}

interface Wallet {
  id: string
  role: WalletRole
  label: string
  address: string
  network: WalletNetwork
  supportedNetworks: WalletNetwork[]
}

interface WalletConnection {
  walletId: string
  provider: "wallet-connect" | "metamask" | "coinbase"
  network: WalletNetwork
  connectedAt: string
}

interface WalletsResponse {
  wallets: Wallet[]
  connection: WalletConnection | null
}

interface Credentials {
  email: string
  password: string
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
} satisfies Record<string, Credentials>

const validAvatarDataUrl =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII="

const walletAddresses = {
  first: `0x${"1".repeat(40)}`,
  second: `0x${"2".repeat(40)}`,
  third: `0x${"3".repeat(40)}`,
  updated: `0x${"9".repeat(40)}`,
}

async function requestFromBrowser<T = unknown>(
  page: Page,
  input: BrowserRequestInput,
): Promise<BrowserResponse<T>> {
  return page.evaluate(async ({ path, method = "GET", body }) => {
    const response = await fetch(path, {
      method,
      headers:
        body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
    const responseText = await response.text()

    return {
      status: response.status,
      body: responseText ? JSON.parse(responseText) : null,
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

async function login(page: Page, credentials: Credentials = users.luna) {
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

async function register(
  page: Page,
  account: { username: string; email: string; password: string },
) {
  const response = await requestFromBrowser(page, {
    path: "/api/auth/register",
    method: "POST",
    body: account,
  })

  expect(response.status).toBe(201)
}

async function getProfile(page: Page) {
  const response = await requestFromBrowser<Profile>(page, {
    path: "/api/profile",
  })

  expect(response.status).toBe(200)

  return response.body
}

async function getWallets(page: Page) {
  const response = await requestFromBrowser<WalletsResponse>(page, {
    path: "/api/wallets",
  })

  expect(response.status).toBe(200)

  return response.body
}

test.describe("API REST da conta do colecionador", () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page)
  })

  test("protege perfil, avatar, senha e carteiras sem uma sessao", async ({
    page,
  }) => {
    const privateRequests: BrowserRequestInput[] = [
      { path: "/api/profile" },
      { path: "/api/profile", method: "PATCH", body: {} },
      {
        path: "/api/profile/avatar",
        method: "PUT",
        body: { dataUrl: validAvatarDataUrl },
      },
      { path: "/api/profile/avatar", method: "DELETE" },
      {
        path: "/api/profile/password",
        method: "PATCH",
        body: {
          currentPassword: users.luna.password,
          newPassword: "NovaSenha@123",
        },
      },
      { path: "/api/wallets" },
      {
        path: "/api/wallets",
        method: "POST",
        body: {
          label: "Carteira principal",
          address: walletAddresses.first,
          network: "ethereum",
        },
      },
      {
        path: "/api/wallets/wallet_luna_primary",
        method: "PATCH",
        body: { label: "Carteira atualizada" },
      },
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

  test("consulta, atualiza e persiste os dados do perfil", async ({ page }) => {
    await login(page)

    const initialProfile = await getProfile(page)

    expect(initialProfile).toMatchObject({
      id: "user_luna-rocha",
      displayName: "Luna Rocha",
      username: "luna.rocha",
      email: users.luna.email,
      ensName: "luna-rocha.eth",
      avatarUrl: null,
      walletAlias: expect.any(String),
    })

    const updateResponse = await requestFromBrowser<Profile>(page, {
      path: "/api/profile",
      method: "PATCH",
      body: {
        displayName: "Luna da Rocha",
        username: "luna.curadora",
        email: "  LUNA.NOVA@KURIO.TEST  ",
        ensName: "LUNA-CURADORA.ETH",
        walletAlias: "Acervo principal",
      },
    })

    expect(updateResponse.status).toBe(200)
    expect(updateResponse.body).toMatchObject({
      displayName: "Luna da Rocha",
      username: "luna.curadora",
      email: "luna.nova@kurio.test",
      ensName: "luna-curadora.eth",
      walletAlias: "Acervo principal",
    })

    await page.reload()
    await expect(
      page.getByRole("region", { name: "Mercado de NFTs" }),
    ).toHaveAttribute("aria-busy", "false")

    const persistedProfile = await getProfile(page)
    const wallets = await getWallets(page)

    expect(persistedProfile).toEqual(updateResponse.body)
    expect(
      wallets.wallets.find((wallet) => wallet.role === "primary")?.label,
    ).toBe("Acervo principal")
  })

  test("retorna validacao e conflitos de e-mail e nome de usuario", async ({
    page,
  }) => {
    await login(page)

    const invalidResponse = await requestFromBrowser<ApiErrorBody>(page, {
      path: "/api/profile",
      method: "PATCH",
      body: {
        displayName: "L",
        username: "x",
        email: "email-invalido",
        ensName: "ens-invalido",
        walletAlias: "x",
      },
    })

    expect(invalidResponse.status).toBe(400)
    expect(invalidResponse.body).toMatchObject({
      error: {
        code: "INVALID_PROFILE_REQUEST",
        fieldErrors: {
          displayName: expect.any(Array),
          username: expect.any(Array),
          email: expect.any(Array),
          ensName: expect.any(Array),
          walletAlias: expect.any(Array),
        },
      },
    })

    const profile = await getProfile(page)
    const missingWalletAliasResponse =
      await requestFromBrowser<ApiErrorBody>(page, {
        path: "/api/profile",
        method: "PATCH",
        body: {
          displayName: profile.displayName,
          username: profile.username,
          email: profile.email,
          ensName: profile.ensName,
          walletAlias: null,
        },
      })

    expect(missingWalletAliasResponse.status).toBe(422)
    expect(missingWalletAliasResponse.body).toMatchObject({
      error: {
        code: "WALLET_ALIAS_REQUIRED",
        fieldErrors: { walletAlias: expect.any(Array) },
      },
    })

    const emailConflictResponse = await requestFromBrowser<ApiErrorBody>(page, {
      path: "/api/profile",
      method: "PATCH",
      body: {
        displayName: profile.displayName,
        username: profile.username,
        email: users.davi.email,
        ensName: profile.ensName,
        walletAlias: profile.walletAlias,
      },
    })

    expect(emailConflictResponse.status).toBe(409)
    expect(emailConflictResponse.body).toMatchObject({
      error: {
        code: "EMAIL_ALREADY_EXISTS",
        fieldErrors: { email: expect.any(Array) },
      },
    })

    const usernameConflictResponse = await requestFromBrowser<ApiErrorBody>(
      page,
      {
        path: "/api/profile",
        method: "PATCH",
        body: {
          displayName: profile.displayName,
          username: "DAVI.MOURA",
          email: profile.email,
          ensName: profile.ensName,
          walletAlias: profile.walletAlias,
        },
      },
    )

    expect(usernameConflictResponse.status).toBe(409)
    expect(usernameConflictResponse.body).toMatchObject({
      error: {
        code: "USERNAME_ALREADY_EXISTS",
        fieldErrors: { username: expect.any(Array) },
      },
    })
  })

  test("persiste um avatar valido, permite remove-lo e rejeita formato invalido", async ({
    page,
  }) => {
    await login(page)

    const invalidResponse = await requestFromBrowser<ApiErrorBody>(page, {
      path: "/api/profile/avatar",
      method: "PUT",
      body: { dataUrl: "data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=" },
    })

    expect(invalidResponse.status).toBe(400)
    expect(invalidResponse.body).toMatchObject({
      error: {
        code: "INVALID_PROFILE_REQUEST",
        fieldErrors: { dataUrl: expect.any(Array) },
      },
    })

    const updateResponse = await requestFromBrowser<Profile>(page, {
      path: "/api/profile/avatar",
      method: "PUT",
      body: { dataUrl: validAvatarDataUrl },
    })

    expect(updateResponse.status).toBe(200)
    expect(updateResponse.body.avatarUrl).toBe(validAvatarDataUrl)

    await page.reload()
    await expect(
      page.getByRole("region", { name: "Mercado de NFTs" }),
    ).toHaveAttribute("aria-busy", "false")
    expect((await getProfile(page)).avatarUrl).toBe(validAvatarDataUrl)

    const removeResponse = await requestFromBrowser<Profile>(page, {
      path: "/api/profile/avatar",
      method: "DELETE",
    })

    expect(removeResponse.status).toBe(200)
    expect(removeResponse.body.avatarUrl).toBeNull()
    expect((await getProfile(page)).avatarUrl).toBeNull()
  })

  test("troca a senha sem armazenar texto claro e invalida a senha anterior", async ({
    page,
  }) => {
    await login(page)

    const invalidCurrentPasswordResponse =
      await requestFromBrowser<ApiErrorBody>(page, {
        path: "/api/profile/password",
        method: "PATCH",
        body: {
          currentPassword: "SenhaErrada@123",
          newPassword: "SenhaNova@123",
        },
      })

    expect(invalidCurrentPasswordResponse.status).toBe(422)
    expect(invalidCurrentPasswordResponse.body).toMatchObject({
      error: {
        code: "INVALID_CURRENT_PASSWORD",
        fieldErrors: { currentPassword: expect.any(Array) },
      },
    })

    const newPassword = "SenhaNova@123"
    const changeResponse = await requestFromBrowser(page, {
      path: "/api/profile/password",
      method: "PATCH",
      body: {
        currentPassword: users.luna.password,
        newPassword,
      },
    })

    expect(changeResponse).toEqual({ status: 204, body: null })

    const localStorageValues = await page.evaluate(() =>
      Object.values(localStorage),
    )
    const serializedStorage = JSON.stringify(localStorageValues)

    expect(serializedStorage).not.toContain(users.luna.password)
    expect(serializedStorage).not.toContain(newPassword)

    const authState = await page.evaluate(() => {
      const value = localStorage.getItem("kurio_mock_auth_v2")

      return value ? JSON.parse(value) : null
    })
    const lunaAccount = authState.accounts.find(
      (account: { user: { id: string } }) =>
        account.user.id === "user_luna-rocha",
    )

    expect(lunaAccount.passwordDigest).toMatch(/^[a-f0-9]{64}$/)

    await logout(page)

    const oldPasswordResponse = await requestFromBrowser<ApiErrorBody>(page, {
      path: "/api/auth/login",
      method: "POST",
      body: users.luna,
    })

    expect(oldPasswordResponse.status).toBe(401)
    expect(oldPasswordResponse.body).toMatchObject({
      error: { code: "INVALID_CREDENTIALS" },
    })

    const newPasswordResponse = await requestFromBrowser(page, {
      path: "/api/auth/login",
      method: "POST",
      body: { email: users.luna.email, password: newPassword },
    })

    expect(newPasswordResponse.status).toBe(200)
  })

  test("cadastra carteiras primaria e secundaria com validacao, duplicidade e limite", async ({
    page,
  }) => {
    await register(page, {
      username: "wallet.owner",
      email: "wallet.owner@kurio.test",
      password: "Wallet@123",
    })

    expect(await getWallets(page)).toEqual({ wallets: [], connection: null })

    const invalidResponse = await requestFromBrowser<ApiErrorBody>(page, {
      path: "/api/wallets",
      method: "POST",
      body: {
        label: "Principal",
        address: "endereco-invalido",
        network: "ethereum",
      },
    })

    expect(invalidResponse.status).toBe(400)
    expect(invalidResponse.body).toMatchObject({
      error: {
        code: "INVALID_WALLET_REQUEST",
        fieldErrors: { address: expect.any(Array) },
      },
    })

    const firstResponse = await requestFromBrowser<Wallet>(page, {
      path: "/api/wallets",
      method: "POST",
      body: {
        label: "Principal",
        address: walletAddresses.first,
        network: "ethereum",
      },
    })

    expect(firstResponse.status).toBe(201)
    expect(firstResponse.body).toMatchObject({
      role: "primary",
      label: "Principal",
      address: walletAddresses.first,
      network: "ethereum",
      supportedNetworks: ["ethereum", "polygon"],
    })

    const duplicateResponse = await requestFromBrowser<ApiErrorBody>(page, {
      path: "/api/wallets",
      method: "POST",
      body: {
        label: "Duplicada",
        address: walletAddresses.first.toUpperCase().replace("0X", "0x"),
        network: "polygon",
      },
    })

    expect(duplicateResponse.status).toBe(409)
    expect(duplicateResponse.body).toMatchObject({
      error: {
        code: "WALLET_ALREADY_REGISTERED",
        fieldErrors: { address: expect.any(Array) },
      },
    })

    const secondResponse = await requestFromBrowser<Wallet>(page, {
      path: "/api/wallets",
      method: "POST",
      body: {
        label: "Secundaria",
        address: walletAddresses.second,
        network: "polygon",
      },
    })

    expect(secondResponse.status).toBe(201)
    expect(secondResponse.body.role).toBe("secondary")

    const limitResponse = await requestFromBrowser<ApiErrorBody>(page, {
      path: "/api/wallets",
      method: "POST",
      body: {
        label: "Terceira",
        address: walletAddresses.third,
        network: "ethereum",
      },
    })

    expect(limitResponse.status).toBe(409)
    expect(limitResponse.body).toMatchObject({
      error: { code: "WALLET_LIMIT_REACHED" },
    })
    expect((await getWallets(page)).wallets).toHaveLength(2)
  })

  test("edita e persiste a carteira, desconecta ao trocar o endereco e isola usuarios", async ({
    page,
  }) => {
    await login(page)

    const connectionResponse = await requestFromBrowser<WalletConnection>(
      page,
      {
        path: "/api/wallets/wallet_luna_primary/connect",
        method: "POST",
        body: { provider: "metamask", network: "ethereum" },
      },
    )

    expect(connectionResponse.status).toBe(200)
    expect((await getWallets(page)).connection).toMatchObject({
      walletId: "wallet_luna_primary",
    })

    const emptyUpdateResponse = await requestFromBrowser<ApiErrorBody>(page, {
      path: "/api/wallets/wallet_luna_primary",
      method: "PATCH",
      body: {},
    })

    expect(emptyUpdateResponse.status).toBe(400)
    expect(emptyUpdateResponse.body).toMatchObject({
      error: {
        code: "INVALID_WALLET_REQUEST",
        fieldErrors: { request: expect.any(Array) },
      },
    })

    const updateResponse = await requestFromBrowser<Wallet>(page, {
      path: "/api/wallets/wallet_luna_primary",
      method: "PATCH",
      body: {
        label: "Carteira de curadoria",
        address: walletAddresses.updated,
      },
    })

    expect(updateResponse.status).toBe(200)
    expect(updateResponse.body).toMatchObject({
      id: "wallet_luna_primary",
      role: "primary",
      label: "Carteira de curadoria",
      address: walletAddresses.updated,
    })

    const lunaWallets = await getWallets(page)

    expect(lunaWallets.connection).toBeNull()
    expect(
      lunaWallets.wallets.find((wallet) => wallet.id === "wallet_luna_primary"),
    ).toEqual(updateResponse.body)

    await page.reload()
    await expect(
      page.getByRole("region", { name: "Mercado de NFTs" }),
    ).toHaveAttribute("aria-busy", "false")
    expect(
      (await getWallets(page)).wallets.find(
        (wallet) => wallet.id === "wallet_luna_primary",
      ),
    ).toEqual(updateResponse.body)

    await logout(page)
    await login(page, users.davi)

    const daviWallets = await getWallets(page)

    expect(daviWallets.wallets).toHaveLength(2)
    expect(daviWallets.wallets).not.toContainEqual(
      expect.objectContaining({ address: walletAddresses.updated }),
    )
    expect(daviWallets.wallets).not.toContainEqual(
      expect.objectContaining({ label: "Carteira de curadoria" }),
    )
  })

  test("mantem carteiras persistidas e isoladas entre contas novas", async ({
    page,
  }) => {
    const firstAccount = {
      username: "first.collector",
      email: "first.collector@kurio.test",
      password: "First@123",
    }
    const secondAccount = {
      username: "second.collector",
      email: "second.collector@kurio.test",
      password: "Second@123",
    }

    await register(page, firstAccount)

    const createResponse = await requestFromBrowser<Wallet>(page, {
      path: "/api/wallets",
      method: "POST",
      body: {
        label: "Carteira da primeira conta",
        address: walletAddresses.first,
        network: "ethereum",
      },
    })

    expect(createResponse.status).toBe(201)

    await page.reload()
    await expect(
      page.getByRole("region", { name: "Mercado de NFTs" }),
    ).toHaveAttribute("aria-busy", "false")
    expect((await getWallets(page)).wallets).toEqual([createResponse.body])

    await logout(page)
    await register(page, secondAccount)
    expect(await getWallets(page)).toEqual({ wallets: [], connection: null })

    await logout(page)
    await login(page, firstAccount)
    expect((await getWallets(page)).wallets).toEqual([createResponse.body])
  })
})
