import { expect, test } from "@playwright/test"

import { setMockScenario } from "./support/mock-scenario.js"

const validCredentials = {
  email: "luna.rocha@kurio.test",
  password: "Kurio@123",
}

test.describe("Interface de autenticação", () => {
  test.beforeEach(async ({ context }) => {
    await setMockScenario(context, "default")
  })

  test("entra pelo carrinho e retorna ao fluxo anterior", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.goto("/?q=Genesis")
    await page.goto("/cart?source=header#summary")
    await page.getByRole("link", { name: "Entrar", exact: true }).click()

    expect(new URL(page.url()).searchParams.get("returnTo")).toBe(
      "/cart?source=header#summary",
    )

    const dialog = page.getByRole("dialog", { name: "Entrar" })

    await dialog.getByLabel("E-mail", { exact: true }).fill(validCredentials.email)
    await dialog.getByLabel("Senha", { exact: true }).fill(validCredentials.password)

    const loginResponse = page.waitForResponse(
      (response) =>
        response.request().method() === "POST" &&
        response.url().endsWith("/api/auth/login"),
    )

    await dialog.getByRole("button", { name: "Entrar", exact: true }).click()

    expect((await loginResponse).status()).toBe(200)
    await expect(page).toHaveURL(/\/cart\?source=header#summary$/)

    await page.goBack()
    await expect(page).toHaveURL("/?q=Genesis")
  })

  test("informa credenciais inválidas e libera uma nova tentativa", async ({
    page,
  }) => {
    const hiddenHomeRequests: string[] = []

    page.on("request", (request) => {
      const pathname = new URL(request.url()).pathname

      if (pathname === "/api/nfts" || pathname === "/api/cart") {
        hiddenHomeRequests.push(pathname)
      }
    })

    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto("/login")

    const dialog = page.getByRole("dialog", { name: "Entrar" })
    const submitButton = dialog.getByRole("button", {
      name: "Entrar",
      exact: true,
    })

    await expect(dialog).toBeVisible()
    expect(hiddenHomeRequests).toEqual([])

    await dialog.getByLabel("E-mail", { exact: true }).fill(validCredentials.email)
    await dialog.getByLabel("Senha", { exact: true }).fill("Senha@Incorreta")
    await submitButton.click()

    await expect(dialog.getByRole("alert")).toHaveText(
      "E-mail ou senha inválidos.",
    )
    await expect(submitButton).toBeEnabled()
    await expect(page).toHaveURL(/\/login$/)
  })

  test("valida os campos antes de chamar a API", async ({ page }) => {
    let loginRequests = 0

    page.on("request", (request) => {
      if (
        request.method() === "POST" &&
        request.url().endsWith("/api/auth/login")
      ) {
        loginRequests += 1
      }
    })

    await page.goto("/login")

    const dialog = page.getByRole("dialog", { name: "Entrar" })
    const emailInput = dialog.getByLabel("E-mail", { exact: true })
    const passwordInput = dialog.getByLabel("Senha", { exact: true })

    await emailInput.fill("email-invalido")
    await passwordInput.fill("curta")
    await dialog.getByRole("button", { name: "Entrar", exact: true }).click()

    await expect(emailInput).toHaveAttribute("aria-invalid", "true")
    await expect(passwordInput).toHaveAttribute("aria-invalid", "true")
    await expect(dialog.getByText("Informe um e-mail válido.")).toBeVisible()
    await expect(
      dialog.getByText("A senha deve ter pelo menos 8 caracteres."),
    ).toBeVisible()
    expect(loginRequests).toBe(0)
  })

  test("mantém todo o cadastro acessível em uma viewport desktop baixa", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 640 })
    await page.goto("/register")

    const dialog = page.getByRole("dialog", { name: "Criar conta" })
    const dialogBox = await dialog.boundingBox()

    expect(dialogBox).not.toBeNull()
    expect(dialogBox?.y).toBeGreaterThanOrEqual(16)
    expect((dialogBox?.y ?? 0) + (dialogBox?.height ?? 0)).toBeLessThanOrEqual(
      624,
    )

    const facebookButton = dialog.getByRole("button", {
      name: "Continuar com Facebook",
    })

    await facebookButton.scrollIntoViewIfNeeded()
    await expect(facebookButton).toBeVisible()
  })

  test("limita o formulário em tablet sem reduzir o fundo da rota", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto("/login")

    const dialog = page.getByRole("dialog", { name: "Entrar" })

    await expect
      .poll(async () => (await dialog.boundingBox())?.width)
      .toBe(768)

    const emailBox = await dialog
      .getByLabel("E-mail", { exact: true })
      .boundingBox()

    expect(emailBox?.width).toBeLessThanOrEqual(358)
    expect(emailBox?.x).toBeGreaterThan(200)
  })

  test("trata conflito de cadastro e conclui com dados únicos", async ({
    page,
  }) => {
    await page.goto("/register?returnTo=%2F")

    const dialog = page.getByRole("dialog", { name: "Criar conta" })
    const usernameInput = dialog.getByLabel("Nome de usuário", { exact: true })
    const emailInput = dialog.getByLabel("E-mail", { exact: true })

    await usernameInput.fill("colecionadora.ui")
    await emailInput.fill("luna.rocha@kurio.test")
    await dialog.getByLabel("Senha", { exact: true }).fill("Segura@123")
    await dialog
      .getByLabel("Confirmar senha", { exact: true })
      .fill("Segura@123")
    const conflictResponse = page.waitForResponse(
      (response) =>
        response.request().method() === "POST" &&
        response.url().endsWith("/api/auth/register") &&
        response.status() === 409,
    )
    await dialog
      .getByRole("button", { name: "Criar conta", exact: true })
      .click()
    await conflictResponse

    await expect(
      dialog.getByText("Este e-mail já está cadastrado."),
    ).toBeVisible()
    await expect(emailInput).toBeFocused()

    await emailInput.fill("colecionadora.ui@kurio.test")

    const registerResponse = page.waitForResponse(
      (response) =>
        response.request().method() === "POST" &&
        response.url().endsWith("/api/auth/register") &&
        response.status() === 201,
    )

    await dialog
      .getByRole("button", { name: "Criar conta", exact: true })
      .click()

    await registerResponse
    await expect(page).toHaveURL("/")
  })

  test("preserva filtros e bloqueia returnTo externo", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.goto("/?category=digital-art#catalogo")
    await page.getByRole("link", { name: "Entrar", exact: true }).click()

    expect(new URL(page.url()).searchParams.get("returnTo")).toBe(
      "/?category=digital-art#catalogo",
    )

    await page.getByRole("link", { name: "Criar conta", exact: true }).click()
    expect(new URL(page.url()).searchParams.get("returnTo")).toBe(
      "/?category=digital-art#catalogo",
    )

    await page.keyboard.press("Escape")
    await expect(page).toHaveURL("/?category=digital-art#catalogo")

    await page.goto("/nfts/genesis-circuit-014?source=featured#purchase")
    await page.getByRole("link", { name: "Entrar", exact: true }).click()
    expect(new URL(page.url()).searchParams.get("returnTo")).toBe(
      "/nfts/genesis-circuit-014?source=featured#purchase",
    )
    await expect(page.getByRole("dialog", { name: "Entrar" })).toBeVisible()
    await page.keyboard.press("Escape")
    await expect(page).toHaveURL(
      "/nfts/genesis-circuit-014?source=featured#purchase",
    )

    await page.goto("/login?returnTo=https%3A%2F%2Fevil.test")
    await expect(page.getByRole("dialog", { name: "Entrar" })).toBeVisible()
    await page.keyboard.press("Escape")
    await expect(page).toHaveURL("/")

    for (const unsafeAuthPath of ["/LOGIN", "/l%6Fgin", "/ReGiStEr"]) {
      await page.goto(
        `/login?returnTo=${encodeURIComponent(unsafeAuthPath)}`,
      )
      await expect(page.getByRole("dialog", { name: "Entrar" })).toBeVisible()
      await page.keyboard.press("Escape")
      await expect(page).toHaveURL("/")
    }

    for (const normalizedExternalPath of [
      "/..//evil.test",
      "/.//evil.test",
      "/a/..//evil.test",
      "/%2e%2e//evil.test",
    ]) {
      await page.goto(
        `/login?returnTo=${encodeURIComponent(normalizedExternalPath)}`,
      )
      await expect(page.getByRole("dialog", { name: "Entrar" })).toBeVisible()
      await page.keyboard.press("Escape")
      await expect(page).toHaveURL("/")
    }
  })

  test("fecha uma autenticação direta sem reabrir a rota protegida", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 1000 })

    for (const returnTo of ["/favorites", "/favorites,"]) {
      await page.goto(`/login?returnTo=${encodeURIComponent(returnTo)}`)

      const dialog = page.getByRole("dialog", { name: "Entrar" })

      await expect(dialog).toBeVisible()
      expect(
        await dialog.evaluate((element) => element.closest("#root") === null),
      ).toBe(true)

      await page.keyboard.press("Escape")

      await expect(page).toHaveURL("/")
      await expect(dialog).toBeHidden()
    }
  })
})
