import { expect, test } from "@playwright/test"

import { waitForMockService } from "./support/mock-readiness.js"
import { setMockScenario } from "./support/mock-scenario.js"

test.describe("navegação interna da página inicial", () => {
  test("usa scroll suave no desktop e respeita movimento reduzido", async ({
    context,
    page,
  }) => {
    await setMockScenario(context, "default")
    await page.emulateMedia({ reducedMotion: "no-preference" })
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.goto("/")
    await waitForMockService(page)

    for (const target of ["#inicio", "#catalogo", "#criadores", "#aprenda"]) {
      await expect(page.locator(target)).toHaveCount(1)
    }

    await expect
      .poll(() =>
        page.evaluate(
          "getComputedStyle(document.documentElement).scrollBehavior",
        ),
      )
      .toBe("smooth")

    const navigation = page
      .getByRole("navigation", { name: "Navegação principal" })
      .first()
    const startLink = navigation.getByRole("link", {
      name: "Início",
      exact: true,
    })
    const marketLink = navigation.getByRole("link", {
      name: "Mercado",
      exact: true,
    })
    const creatorsLink = navigation.getByRole("link", {
      name: "Criadores",
      exact: true,
    })
    const learnLink = navigation.getByRole("link", {
      name: "Aprenda",
      exact: true,
    })

    await expect(startLink).toHaveAttribute("aria-current", "page")

    await marketLink.click()
    await expect(page).toHaveURL(/#catalogo$/)
    await expect(marketLink).toHaveAttribute("aria-current", "page")
    await expect(startLink).not.toHaveAttribute("aria-current", "page")
    await expect
      .poll(() => page.evaluate<number>("window.scrollY"))
      .toBeGreaterThan(0)

    await creatorsLink.click()
    await expect(page).toHaveURL(/#criadores$/)
    await expect(creatorsLink).toHaveAttribute("aria-current", "page")

    await learnLink.click()
    await expect(page).toHaveURL(/#aprenda$/)
    await expect(learnLink).toHaveAttribute("aria-current", "page")

    await page.locator("#catalogo").evaluate((element) => {
      element.scrollIntoView()
    })
    await expect(marketLink).toHaveAttribute("aria-current", "page")

    await page.evaluate("window.scrollTo(0, 0)")
    await expect(startLink).toHaveAttribute("aria-current", "page")
    await expect(navigation.locator('[aria-current="page"]')).toHaveCount(1)

    await page.emulateMedia({ reducedMotion: "reduce" })
    await expect
      .poll(() =>
        page.evaluate(
          "getComputedStyle(document.documentElement).scrollBehavior",
        ),
      )
      .toBe("auto")
  })

  test("mantém o destino Mercado disponível na navegação mobile", async ({
    context,
    page,
  }) => {
    await setMockScenario(context, "default")
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto("/")
    await waitForMockService(page)

    const homeLink = page.getByRole("link", { name: "Início", exact: true })
    const marketLink = page.getByRole("link", { name: "Mercado", exact: true })

    await expect(homeLink).toHaveAttribute("aria-current", "page")
    await expect(marketLink).toHaveAttribute("href", "#catalogo")
    await expect(page.locator("#catalogo")).toHaveCount(1)
    await marketLink.click()
    await expect(page).toHaveURL(/#catalogo$/)
    await expect(marketLink).toHaveAttribute("aria-current", "page")
    await expect(homeLink).not.toHaveAttribute("aria-current", "page")
  })

  test("mantém o conteúdo da faixa de contato dentro do footer", async ({
    context,
    page,
  }) => {
    await setMockScenario(context, "default")
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.goto("/")
    await waitForMockService(page)

    const footerSections = page.locator("footer section")
    const contactSection = footerSections.nth(1)
    const linksSection = footerSections.nth(2)
    const tagline = contactSection.getByText(
      "Feito para colecionadores, criadores e cultura",
    )

    await expect(tagline).toBeVisible()

    const [contactBounds, taglineBounds, linksBounds] = await Promise.all([
      contactSection.boundingBox(),
      tagline.boundingBox(),
      linksSection.boundingBox(),
    ])

    expect(contactBounds).not.toBeNull()
    expect(taglineBounds).not.toBeNull()
    expect(linksBounds).not.toBeNull()
    expect(taglineBounds!.y).toBeGreaterThanOrEqual(contactBounds!.y)
    expect(taglineBounds!.y + taglineBounds!.height).toBeLessThanOrEqual(
      contactBounds!.y + contactBounds!.height,
    )
    expect(contactBounds!.y + contactBounds!.height).toBe(linksBounds!.y)
  })
})
