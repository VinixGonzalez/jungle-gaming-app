import { expect, test } from "@playwright/test"

test.describe("rota não encontrada", () => {
  test("mantém a URL e apresenta uma saída segura", async ({ page }) => {
    await page.goto("/rota-inexistente?source=test#detalhe")

    await expect(page).toHaveURL(
      "/rota-inexistente?source=test#detalhe",
    )
    await expect(page).toHaveTitle("Página não encontrada | Kurio")
    await expect(
      page.getByRole("heading", { name: "Página não encontrada" }),
    ).toBeVisible()

    await page.reload()

    await expect(
      page.getByRole("heading", { name: "Página não encontrada" }),
    ).toBeVisible()

    await page.getByRole("link", { name: "Voltar ao início" }).click()

    await expect(page).toHaveURL("/")
    await expect(
      page.getByRole("heading", {
        name: "SEJA DONO DO FUTURO DA ARTE DIGITAL",
      }),
    ).toBeVisible()
  })
})
