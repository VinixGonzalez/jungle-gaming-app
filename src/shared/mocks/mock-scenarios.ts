const mockScenarioValues = [
  "default",
  "catalog-empty",
  "catalog-slow",
  "catalog-server-error",
  "catalog-network-error",
  "catalog-timeout",
  "catalog-out-of-order",
  "nft-detail-slow",
  "nft-detail-server-error",
  "nft-detail-network-error",
  "nft-detail-timeout",
  "cart-slow",
  "cart-server-error",
  "cart-network-error",
  "auth-session-expired",
  "auth-logout-error",
  "profile-server-error",
  "favorites-server-error",
  "favorite-mutation-error",
  "wallet-connection-refused",
  "checkout-quote-changed",
  "checkout-item-unavailable",
  "order-timeout-after-create",
  "payment-declined",
  "order-pending",
  "realtime-nft-update",
  "realtime-nft-event-ordering",
  "realtime-order-reconnect",
] as const

export type MockScenario = (typeof mockScenarioValues)[number]

const defaultMockScenario: MockScenario = "default"
const mockScenarioCookieName = "kurio_mock_scenario"

function resolveMockScenario(...candidates: unknown[]): MockScenario {
  for (const candidate of candidates) {
    if (
      typeof candidate === "string" &&
      mockScenarioValues.includes(candidate as MockScenario)
    ) {
      return candidate as MockScenario
    }
  }

  return defaultMockScenario
}

export const mockScenarios = {
  cookieName: mockScenarioCookieName,
  defaultScenario: defaultMockScenario,
  resolve: resolveMockScenario,
}
