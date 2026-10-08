import type { AuthUser } from "@/features/auth"
import type { WalletsResponse } from "@/features/wallets"
import { mockApi } from "@/shared/mocks"
import {
  mockScenarioCookieName,
  resolveMockScenario,
} from "@/shared/mocks"

import { collectorProfileSchema } from "../api/account.schemas"
import type { AccountHandlerDependencies } from "./account-handler.dependencies"

const responseDelay = 200

function createErrorResponse(
  code: string,
  message: string,
  status: number,
  fieldErrors?: Record<string, string[]>,
) {
  return mockApi.createErrorResponse(code, message, status, { fieldErrors })
}

export const accountHandlerHelpers = {
  responseDelay,

  createErrorResponse,

  createAuthenticationRequiredResponse() {
    return createErrorResponse(
      "AUTH_REQUIRED",
      "Authentication is required.",
      401,
    )
  },

  createInvalidRequestResponse(
    issues: readonly { path: PropertyKey[]; message: string }[],
  ) {
    return createErrorResponse(
      "INVALID_PROFILE_REQUEST",
      "The profile request is invalid.",
      400,
      mockApi.createFieldErrors(issues),
    )
  },

  createProfile(user: AuthUser, wallets: WalletsResponse) {
    const primaryWallet = wallets.wallets.find(
      (wallet) => wallet.role === "primary",
    )

    return collectorProfileSchema.parse({
      ...user,
      walletAlias: primaryWallet?.label ?? null,
    })
  },

  getAuthenticatedContext(auth: AccountHandlerDependencies["auth"]) {
    const userId = auth.getAuthenticatedUserId()
    const user = userId ? auth.getUser(userId) : null

    return userId && user ? { userId, user } : null
  },

  isUnavailable(cookies: Record<string, string | undefined>) {
    return (
      resolveMockScenario(
        cookies[mockScenarioCookieName],
        import.meta.env.VITE_MOCK_SCENARIO,
      ) === "profile-server-error"
    )
  },
}
