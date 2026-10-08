import { mockScenarios } from "./mock-scenarios.js"

export { mockApi } from "./mock-api.js"
export { mockScenarios }
export type { MockScenario } from "./mock-scenarios.js"

export const {
  cookieName: mockScenarioCookieName,
  resolve: resolveMockScenario,
} = mockScenarios
