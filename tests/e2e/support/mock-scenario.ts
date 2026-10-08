import type { BrowserContext, Page } from "@playwright/test"

import {
  mockScenarioCookieName,
  type MockScenario,
} from "../../../src/shared/mocks/index.js"

const applicationUrl = "http://127.0.0.1:4173"

export async function openAppWithMockScenario(
  page: Page,
  context: BrowserContext,
  scenario: MockScenario,
  path = "/",
) {
  await setMockScenario(context, scenario)
  await page.goto(path)
}

export async function setMockScenario(
  context: BrowserContext,
  scenario: MockScenario,
) {
  await context.addCookies([
    {
      name: mockScenarioCookieName,
      value: scenario,
      url: applicationUrl,
    },
  ])
}

export async function resetMockScenario(context: BrowserContext) {
  await context.clearCookies({ name: mockScenarioCookieName })
}
