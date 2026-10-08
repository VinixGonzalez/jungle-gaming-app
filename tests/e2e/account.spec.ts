import {
  expect,
  test,
  type BrowserContext,
  type Page,
} from "@playwright/test"

import {
  expectNoHorizontalOverflow,
  genesisLimitedEdition,
  seedCart,
} from "./support/cart.js"
import { waitForMockService } from "./support/mock-readiness.js"
import { setMockScenario } from "./support/mock-scenario.js"

const credentials = {
  email: "luna.rocha@kurio.test",
  password: "Kurio@123",
}

const primaryWalletAddress =
  "0x1111111111111111111111111111111111111111"
const secondaryWalletAddress =
  "0x2222222222222222222222222222222222222222"
const updatedSecondaryWalletAddress =
  "0x3333333333333333333333333333333333333333"

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

async function loginThroughForm(page: Page) {
  const dialog = page.getByRole("dialog", { name: "Entrar" })

  await dialog.getByLabel("E-mail", { exact: true }).fill(credentials.email)
  await dialog.getByLabel("Senha", { exact: true }).fill(credentials.password)
  await dialog.getByRole("button", { name: "Entrar", exact: true }).click()
}

async function openAuthenticatedPage(
  page: Page,
  context: BrowserContext,
  path: "/profile" | "/wallets",
) {
  await setMockScenario(context, "default")
  await page.goto("/")
  await waitForHome(page)
  await loginThroughApi(page)
  await page.goto(path)
}

async function registerWalletCollector(page: Page) {
  await waitForMockService(page)
  const account = {
    email: "wallet.e2e@kurio.test",
    password: "Wallet@123",
    username: "wallet.e2e",
  }
  const response = await page.evaluate(async (input) => {
    const result = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })

    return { body: await result.text(), status: result.status }
  }, account)

  expect(response.status, response.body).toBe(201)
}

test.describe("conta do colecionador", () => {
  test("protege a conta e retorna para a rota completa após o login", async ({
    context,
    page,
  }) => {
    await setMockScenario(context, "default")
    await page.goto("/wallets?source=account#secondary")

    await expect
      .poll(() => new URL(page.url()).pathname)
      .toBe("/login")
    expect(new URL(page.url()).searchParams.get("returnTo")).toBe(
      "/wallets?source=account#secondary",
    )

    await loginThroughForm(page)

    await expect(page).toHaveURL(/\/wallets\?source=account#secondary$/)
    await expect(
      page.getByRole("heading", { name: "Carteira principal" }),
    ).toBeVisible()
  })

  test("carrega, salva e persiste os dados do perfil", async ({
    context,
    page,
  }) => {
    await openAuthenticatedPage(page, context, "/profile")

    const displayName = page.getByLabel("Nome de exibição", {
      exact: true,
    })
    const username = page.getByLabel("Nome de usuário", { exact: true })
    const email = page.getByLabel("E-mail", { exact: true }).first()
    const ensName = page.getByLabel("Nome ENS", { exact: true }).first()
    const walletAlias = page.getByLabel("Apelido da carteira", {
      exact: true,
    })

    await expect(
      page.getByRole("heading", { name: "Perfil do colecionador" }),
    ).toBeVisible()
    await expect(displayName).toHaveValue("Luna Rocha")
    await expect(username).toHaveValue("luna.rocha")
    await expect(email).toHaveValue(credentials.email)
    await expect(ensName).toHaveValue("luna-rocha")
    await expect(walletAlias).toHaveValue("Carteira principal")

    let profileRequests = 0

    page.on("request", (request) => {
      if (
        request.method() === "PATCH" &&
        new URL(request.url()).pathname === "/api/profile"
      ) {
        profileRequests += 1
      }
    })

    await walletAlias.fill("")
    await page.getByRole("button", { name: "Salvar perfil" }).click()
    await expect(
      page.getByText("Informe o apelido da carteira principal."),
    ).toBeVisible()
    await expect(walletAlias).toBeFocused()
    expect(profileRequests).toBe(0)

    await displayName.fill("Luna das Artes")
    await username.fill("luna.curadora")
    await email.fill("luna.curadora@kurio.test")
    await ensName.fill("luna-curadora")
    await walletAlias.fill("Cofre da Luna")

    const updateResponse = page.waitForResponse(
      (response) =>
        response.request().method() === "PATCH" &&
        new URL(response.url()).pathname === "/api/profile",
    )

    await page.getByRole("button", { name: "Salvar perfil" }).click()
    expect((await updateResponse).status()).toBe(200)
    await expect(page.getByRole("status")).toHaveText(
      "Perfil atualizado com sucesso.",
    )

    await page.reload()

    await expect(displayName).toHaveValue("Luna das Artes")
    await expect(username).toHaveValue("luna.curadora")
    await expect(email).toHaveValue("luna.curadora@kurio.test")
    await expect(ensName).toHaveValue("luna-curadora")
    await expect(walletAlias).toHaveValue("Cofre da Luna")
  })

  test("mostra conflitos do backend no campo correto e move o foco", async ({
    context,
    page,
  }) => {
    await openAuthenticatedPage(page, context, "/profile")

    const username = page.getByLabel("Nome de usuário", { exact: true })
    const email = page.getByLabel("E-mail", { exact: true }).first()

    await email.fill("davi.moura@kurio.test")

    const emailConflict = page.waitForResponse(
      (response) =>
        response.request().method() === "PATCH" &&
        new URL(response.url()).pathname === "/api/profile",
    )

    await page.getByRole("button", { name: "Salvar perfil" }).click()
    expect((await emailConflict).status()).toBe(409)
    await expect(
      page.getByText("Este e-mail já está cadastrado."),
    ).toBeVisible()
    await expect(email).toBeFocused()

    await email.fill(credentials.email)
    await username.fill("davi.moura")

    const usernameConflict = page.waitForResponse(
      (response) =>
        response.request().method() === "PATCH" &&
        new URL(response.url()).pathname === "/api/profile",
    )

    await page.getByRole("button", { name: "Salvar perfil" }).click()
    expect((await usernameConflict).status()).toBe(409)
    await expect(
      page.getByText("Este nome de usuário já está em uso."),
    ).toBeVisible()
    await expect(username).toBeFocused()
  })

  test("envia, persiste e remove o avatar", async ({ context, page }) => {
    await openAuthenticatedPage(page, context, "/profile")

    const avatarInput = page.locator('input[type="file"]')
    const avatar = page.getByRole("img", { name: "Avatar de Luna Rocha" })
    const onePixelPng = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
      "base64",
    )
    const uploadResponse = page.waitForResponse(
      (response) =>
        response.request().method() === "PUT" &&
        new URL(response.url()).pathname === "/api/profile/avatar",
    )

    await avatarInput.setInputFiles({
      buffer: onePixelPng,
      mimeType: "image/png",
      name: "avatar.png",
    })

    expect((await uploadResponse).status()).toBe(200)
    await expect(page.getByRole("status")).toHaveText(
      "Avatar atualizado com sucesso.",
    )
    await expect(avatar).toHaveAttribute("src", /^data:image\/png;base64,/)

    await page.reload()
    await expect(avatar).toBeVisible()
    await expect(
      page.getByRole("button", { name: "Alterar", exact: true }),
    ).toBeVisible()

    const removeResponse = page.waitForResponse(
      (response) =>
        response.request().method() === "DELETE" &&
        new URL(response.url()).pathname === "/api/profile/avatar",
    )

    await page.getByRole("button", { name: "Remover" }).click()
    expect((await removeResponse).status()).toBe(200)
    await expect(page.getByRole("status")).toHaveText(
      "Avatar removido com sucesso.",
    )
    await expect(page.getByRole("button", { name: "Adicionar" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Remover" })).toBeDisabled()

    await page.reload()
    await expect(page.getByRole("button", { name: "Adicionar" })).toBeVisible()
  })

  test("valida a senha, trata a senha atual incorreta e persiste a alteração", async ({
    context,
    page,
  }) => {
    await openAuthenticatedPage(page, context, "/profile")

    const currentPassword = page.getByLabel("Senha atual", { exact: true })
    const newPassword = page.getByLabel("Nova senha", { exact: true })
    const passwordConfirmation = page.getByLabel("Confirmar nova senha", {
      exact: true,
    })
    let passwordRequests = 0

    page.on("request", (request) => {
      if (
        request.method() === "PATCH" &&
        new URL(request.url()).pathname === "/api/profile/password"
      ) {
        passwordRequests += 1
      }
    })

    await currentPassword.fill(credentials.password)
    await newPassword.fill("Nova@456")
    await passwordConfirmation.fill("Outra@456")
    await page.getByRole("button", { name: "Alterar senha" }).click()

    await expect(passwordConfirmation).toHaveAttribute("aria-invalid", "true")
    await expect(page.getByText("As senhas devem ser iguais.")).toBeVisible()
    expect(passwordRequests).toBe(0)

    await currentPassword.fill("Incorreta@123")
    await passwordConfirmation.fill("Nova@456")

    const invalidPasswordResponse = page.waitForResponse(
      (response) =>
        response.request().method() === "PATCH" &&
        new URL(response.url()).pathname === "/api/profile/password",
    )

    await page.getByRole("button", { name: "Alterar senha" }).click()
    expect((await invalidPasswordResponse).status()).toBe(422)
    await expect(page.getByText("A senha atual está incorreta.")).toBeVisible()
    await expect(currentPassword).toBeFocused()

    await currentPassword.fill(credentials.password)

    const successResponse = page.waitForResponse(
      (response) =>
        response.request().method() === "PATCH" &&
        new URL(response.url()).pathname === "/api/profile/password",
    )

    await page.getByRole("button", { name: "Alterar senha" }).click()
    expect((await successResponse).status()).toBe(204)
    await expect(page.getByRole("status")).toHaveText(
      "Senha alterada com sucesso.",
    )
    await expect(currentPassword).toHaveValue("")
    await expect(newPassword).toHaveValue("")
    await expect(passwordConfirmation).toHaveValue("")

    const authentication = await page.evaluate(
      async ({ email, newPasswordValue, oldPasswordValue }) => {
        await fetch("/api/auth/session", { method: "DELETE" })

        async function login(password: string) {
          const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          })

          return response.status
        }

        const oldPasswordStatus = await login(oldPasswordValue)
        const newPasswordStatus = await login(newPasswordValue)
        const storedAuth = localStorage.getItem("kurio_mock_auth_v2") ?? ""

        return { newPasswordStatus, oldPasswordStatus, storedAuth }
      },
      {
        email: credentials.email,
        newPasswordValue: "Nova@456",
        oldPasswordValue: credentials.password,
      },
    )

    expect(authentication.oldPasswordStatus).toBe(401)
    expect(authentication.newPasswordStatus).toBe(200)
    expect(authentication.storedAuth).not.toContain("Nova@456")
  })

  test("cadastra e edita carteiras e entrega os mesmos dados ao checkout", async ({
    context,
    page,
  }) => {
    await setMockScenario(context, "default")
    await page.goto("/")
    await waitForHome(page)
    await registerWalletCollector(page)
    await page.goto("/wallets")

    const primarySection = page.getByRole("region", {
      name: "Carteira principal",
    })
    const secondarySection = page.getByRole("region", {
      name: "Carteira secundária",
    })

    await primarySection
      .getByLabel("Apelido da carteira", { exact: true })
      .fill("Cofre principal")
    await primarySection
      .getByLabel("Endereço da carteira", { exact: true })
      .fill(primaryWalletAddress)
    await primarySection
      .getByLabel("Rede", { exact: true })
      .selectOption("ethereum")

    const primaryResponse = page.waitForResponse(
      (response) =>
        response.request().method() === "POST" &&
        new URL(response.url()).pathname === "/api/wallets",
    )

    await primarySection
      .getByRole("button", { name: "Salvar carteira" })
      .click()
    expect((await primaryResponse).status()).toBe(201)
    await expect(page.getByRole("status")).toHaveText(
      "Carteira cadastrada com sucesso.",
    )

    await secondarySection
      .getByRole("button", { name: "Adicionar" })
      .click()
    await secondarySection
      .getByLabel("Apelido da carteira", { exact: true })
      .fill("Carteira de viagens")
    await secondarySection
      .getByLabel("Endereço da carteira", { exact: true })
      .fill(secondaryWalletAddress)
    await secondarySection
      .getByLabel("Rede", { exact: true })
      .selectOption("polygon")

    const secondaryResponse = page.waitForResponse(
      (response) =>
        response.request().method() === "POST" &&
        new URL(response.url()).pathname === "/api/wallets",
    )

    await secondarySection
      .getByRole("button", { name: "Salvar carteira" })
      .click()
    expect((await secondaryResponse).status()).toBe(201)
    await expect(secondarySection.getByText("Carteira de viagens")).toBeVisible()

    await secondarySection.getByRole("button", { name: "Editar" }).click()
    const secondaryAddress = secondarySection.getByLabel(
      "Endereço da carteira",
      { exact: true },
    )

    await secondaryAddress.fill(primaryWalletAddress)

    const duplicateResponse = page.waitForResponse(
      (response) =>
        response.request().method() === "PATCH" &&
        new URL(response.url()).pathname.startsWith("/api/wallets/"),
    )

    await secondarySection
      .getByRole("button", { name: "Salvar carteira" })
      .click()
    expect((await duplicateResponse).status()).toBe(409)
    await expect(
      secondarySection.getByText("Este endereço já está cadastrado."),
    ).toBeVisible()
    await expect(secondaryAddress).toBeFocused()

    await secondarySection
      .getByLabel("Apelido da carteira", { exact: true })
      .fill("Reserva Polygon")
    await secondaryAddress.fill(updatedSecondaryWalletAddress)

    const updateResponse = page.waitForResponse(
      (response) =>
        response.request().method() === "PATCH" &&
        new URL(response.url()).pathname.startsWith("/api/wallets/"),
    )

    await secondarySection
      .getByRole("button", { name: "Salvar carteira" })
      .click()
    expect((await updateResponse).status()).toBe(200)
    await expect(secondarySection.getByText("Reserva Polygon")).toBeVisible()

    await page.reload()
    await expect(
      primarySection.getByLabel("Apelido da carteira", { exact: true }),
    ).toHaveValue("Cofre principal")
    await expect(secondarySection.getByText("Reserva Polygon")).toBeVisible()

    await seedCart(page, [genesisLimitedEdition])
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto("/checkout")

    await expect(
      page.getByRole("radio", { name: /Cofre principal/ }),
    ).toBeChecked()
    await expect(
      page.getByRole("radio", { name: /Reserva Polygon/ }),
    ).toBeVisible()
  })

  test("mantém perfil e carteiras navegáveis por teclado sem overflow no mobile e tablet", async ({
    context,
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await openAuthenticatedPage(page, context, "/profile")

    await expectNoHorizontalOverflow(page)

    const accountNavigation = page.getByRole("navigation", {
      name: "Minha conta",
    })
    const profileLink = accountNavigation.getByRole("link", {
      name: "Perfil",
      exact: true,
    })
    const walletsLink = accountNavigation.getByRole("link", {
      name: "Carteiras",
      exact: true,
    })

    await profileLink.focus()
    await page.keyboard.press("Tab")
    await expect(walletsLink).toBeFocused()
    await page.keyboard.press("Enter")

    await expect(page).toHaveURL(/\/wallets$/)
    await expect(
      page.getByRole("heading", { name: "Carteira principal" }),
    ).toBeVisible()
    await expectNoHorizontalOverflow(page)

    await page.setViewportSize({ width: 768, height: 1024 })
    await expectNoHorizontalOverflow(page)

    await accountNavigation
      .getByRole("link", { name: "Perfil", exact: true })
      .click()
    await expect(page).toHaveURL(/\/profile$/)
    await expectNoHorizontalOverflow(page)
  })
})
