import { expect, test, type Locator, type Page } from "@playwright/test"

import { genesisLimitedEdition, seedCart } from "./support/cart.js"
import { waitForMockService } from "./support/mock-readiness.js"
import { setMockScenario } from "./support/mock-scenario.js"

const credentials = {
  email: "luna.rocha@kurio.test",
  password: "Kurio@123",
}

const textControlSelector = [
  "input:not([type])",
  'input[type="text"]',
  'input[type="email"]',
  'input[type="password"]',
  'input[type="search"]',
  'input[type="tel"]',
  'input[type="url"]',
  "textarea",
].join(",")

async function expectFiniteTextLimits(page: Page) {
  const controls = page.locator(textControlSelector)
  const missingLimits = await controls.evaluateAll((elements) =>
    elements.flatMap((control) =>
      control.hasAttribute("readonly") ||
      Number(control.getAttribute("maxlength")) > 0
        ? []
        : [control.id || control.getAttribute("name") || control.outerHTML],
    ),
  )

  expect(missingLimits).toEqual([])
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

async function expectDarkSelectOptions(select: Locator) {
  const colors = await select.locator("option").first().evaluate((option) => {
    const view = option.ownerDocument.defaultView
    const selectElement = option.parentElement

    if (!view || !selectElement) return null

    const optionStyle = view.getComputedStyle(option)
    const selectStyle = view.getComputedStyle(selectElement)

    return {
      background: optionStyle.backgroundColor,
      color: optionStyle.color,
      colorScheme: selectStyle.colorScheme,
    }
  })

  expect(colors).toEqual({
    background: "rgb(20, 13, 10)",
    color: "rgb(245, 241, 235)",
    colorScheme: "dark",
  })
}

test.describe("segurança dos formulários", () => {
  test("ignora submissões duplicadas enquanto a primeira está em andamento", async ({
    context,
    page,
  }) => {
    await setMockScenario(context, "default")
    await page.goto("/login")
    await waitForMockService(page)

    await page.getByLabel("E-mail", { exact: true }).fill(credentials.email)
    await page.getByLabel("Senha", { exact: true }).fill(credentials.password)

    let loginRequests = 0
    page.on("request", (request) => {
      if (
        request.method() === "POST" &&
        new URL(request.url()).pathname === "/api/auth/login"
      ) {
        loginRequests += 1
      }
    })

    await page
      .getByRole("button", { name: "Entrar", exact: true })
      .evaluate((button) => {
        const loginForm = (button as {
          form: { requestSubmit(): void } | null
        }).form

        if (!loginForm) {
          throw new Error("Formulário de login não encontrado.")
        }

        loginForm.requestSubmit()
        loginForm.requestSubmit()
      })

    await expect(page).toHaveURL(/\/$/)
    expect(loginRequests).toBe(1)
  })

  test("limita todos os campos de texto e mantém os selects legíveis", async ({
    context,
    page,
  }) => {
    await setMockScenario(context, "default")

    await page.goto("/login")
    await waitForMockService(page)
    await expectFiniteTextLimits(page)

    await page.goto("/register")
    await expectFiniteTextLimits(page)

    const username = page.getByLabel("Nome de usuário", { exact: true })
    await username.pressSequentially("x".repeat(100))
    await expect(username).toHaveValue("x".repeat(40))

    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto("/")
    await expect(
      page.getByRole("region", { name: "Mercado de NFTs" }),
    ).toHaveAttribute("aria-busy", "false")
    await expectFiniteTextLimits(page)

    await loginThroughApi(page)
    await page.setViewportSize({ width: 1440, height: 1000 })

    await page.goto("/profile")
    await expect(
      page.getByRole("heading", { name: "Perfil do colecionador" }),
    ).toBeVisible()
    await expectFiniteTextLimits(page)

    await page.goto("/wallets")
    await expect(
      page.getByRole("heading", { name: "Carteira principal" }),
    ).toBeVisible()
    await expectFiniteTextLimits(page)
    await expectDarkSelectOptions(
      page
        .getByRole("region", { name: "Carteira principal" })
        .getByLabel("Rede", { exact: true }),
    )

    await seedCart(page, [genesisLimitedEdition])
    await page.goto("/cart")
    await expect(
      page.getByRole("heading", { level: 1, name: /carrinho/i }),
    ).toBeVisible()
    await expectFiniteTextLimits(page)

    await page.goto("/checkout")
    await expect(
      page.getByRole("heading", { name: "Perfil do colecionador" }),
    ).toBeVisible()
    await expectFiniteTextLimits(page)
    await expectDarkSelectOptions(
      page.getByLabel("Rede", { exact: true }).first(),
    )
  })

  test("a API também rejeita payloads excessivos", async ({ context, page }) => {
    await setMockScenario(context, "default")
    await page.goto("/")
    await waitForMockService(page)

    const response = await page.evaluate(async () => {
      const result = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "x".repeat(41),
          email: `${"x".repeat(255)}@kurio.test`,
          password: "x".repeat(73),
        }),
      })

      return { body: await result.json(), status: result.status }
    })

    expect(response.status).toBe(400)
    expect(response.body).toMatchObject({
      error: {
        code: "INVALID_AUTH_REQUEST",
        fieldErrors: {
          email: expect.any(Array),
          password: expect.any(Array),
          username: expect.any(Array),
        },
      },
    })
  })
})
