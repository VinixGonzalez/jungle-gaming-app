import type { Page } from "@playwright/test"

export async function waitForMockService(page: Page) {
  await page
    .locator("html[data-mock-service-ready='true']")
    .waitFor({ state: "attached" })
}
