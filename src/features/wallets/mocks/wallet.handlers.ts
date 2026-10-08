import { delay, http, HttpResponse } from "msw"

import { mockApi } from "@/shared/mocks"
import { mockScenarioCookieName } from "@/shared/mocks"

import {
  connectWalletBodySchema,
  createWalletInputSchema,
  updateWalletInputSchema,
  walletIdSchema,
} from "../api/wallet.schemas"
import { walletMockService } from "./wallet-mock.service"

const walletResponseDelay = 200

interface WalletHandlerDependencies {
  getAuthenticatedUserId: () => string | null
}

function createWalletErrorResponse(
  code: string,
  message: string,
  status: number,
  fieldErrors?: Record<string, string[]>,
) {
  return mockApi.createErrorResponse(code, message, status, { fieldErrors })
}

function createAuthenticationRequiredResponse() {
  return createWalletErrorResponse(
    "AUTH_REQUIRED",
    "Authentication is required.",
    401,
  )
}

function isConnectionRefusedScenario(
  cookies: Record<string, string | undefined>,
) {
  return (
    cookies[mockScenarioCookieName] === "wallet-connection-refused" ||
    import.meta.env.VITE_MOCK_SCENARIO === "wallet-connection-refused"
  )
}

export function createWalletHandlers({
  getAuthenticatedUserId,
}: WalletHandlerDependencies) {
  return [
    http.get("/api/wallets", async () => {
      await delay(walletResponseDelay)

      const userId = getAuthenticatedUserId()

      if (!userId) return createAuthenticationRequiredResponse()

      return HttpResponse.json(walletMockService.getWallets(userId))
    }),

    http.post("/api/wallets", async ({ request }) => {
      await delay(walletResponseDelay)

      const userId = getAuthenticatedUserId()

      if (!userId) return createAuthenticationRequiredResponse()

      const inputResult = createWalletInputSchema.safeParse(
        await mockApi.readJson(request),
      )

      if (!inputResult.success) {
        return createWalletErrorResponse(
          "INVALID_WALLET_REQUEST",
          "The wallet registration request is invalid.",
          400,
          mockApi.createFieldErrors(inputResult.error.issues),
        )
      }

      const result = walletMockService.createWallet(userId, inputResult.data)

      if (result.status === "duplicate") {
        return createWalletErrorResponse(
          "WALLET_ALREADY_REGISTERED",
          "This wallet is already registered.",
          409,
          { address: ["This wallet is already registered."] },
        )
      }

      if (result.status === "limit-reached") {
        return createWalletErrorResponse(
          "WALLET_LIMIT_REACHED",
          "A collector can register up to two wallets.",
          409,
        )
      }

      if (result.status === "invalid") {
        return createWalletErrorResponse(
          "INVALID_WALLET_REQUEST",
          "The wallet registration request is invalid.",
          400,
          mockApi.createFieldErrors(result.issues),
        )
      }

      return HttpResponse.json(result.wallet, { status: 201 })
    }),

    http.patch("/api/wallets/:walletId", async ({ params, request }) => {
      await delay(walletResponseDelay)

      const userId = getAuthenticatedUserId()

      if (!userId) return createAuthenticationRequiredResponse()

      const walletIdResult = walletIdSchema.safeParse(params.walletId)
      const inputResult = updateWalletInputSchema.safeParse(
        await mockApi.readJson(request),
      )

      if (!walletIdResult.success || !inputResult.success) {
        const issues = [
          ...(walletIdResult.success ? [] : walletIdResult.error.issues),
          ...(inputResult.success ? [] : inputResult.error.issues),
        ]

        return createWalletErrorResponse(
          "INVALID_WALLET_REQUEST",
          "The wallet update request is invalid.",
          400,
          mockApi.createFieldErrors(issues),
        )
      }

      const result = walletMockService.updateWallet(
        userId,
        walletIdResult.data,
        inputResult.data,
      )

      if (result.status === "not-found") {
        return createWalletErrorResponse(
          "WALLET_NOT_FOUND",
          "The selected wallet was not found.",
          404,
        )
      }

      if (result.status === "duplicate") {
        return createWalletErrorResponse(
          "WALLET_ALREADY_REGISTERED",
          "This wallet is already registered.",
          409,
          { address: ["This wallet is already registered."] },
        )
      }

      if (result.status === "invalid") {
        return createWalletErrorResponse(
          "INVALID_WALLET_REQUEST",
          "The wallet update request is invalid.",
          400,
          mockApi.createFieldErrors(result.issues),
        )
      }

      return HttpResponse.json(result.wallet)
    }),

    http.post(
      "/api/wallets/:walletId/connect",
      async ({ cookies, params, request }) => {
        await delay(walletResponseDelay)

        const userId = getAuthenticatedUserId()

        if (!userId) return createAuthenticationRequiredResponse()

        const walletIdResult = walletIdSchema.safeParse(params.walletId)
        const inputResult = connectWalletBodySchema.safeParse(
          await mockApi.readJson(request),
        )

        if (!walletIdResult.success || !inputResult.success) {
          const issues = [
            ...(walletIdResult.success ? [] : walletIdResult.error.issues),
            ...(inputResult.success ? [] : inputResult.error.issues),
          ]

          return createWalletErrorResponse(
            "INVALID_WALLET_REQUEST",
            "The wallet connection request is invalid.",
            400,
            mockApi.createFieldErrors(issues),
          )
        }

        if (isConnectionRefusedScenario(cookies)) {
          return createWalletErrorResponse(
            "WALLET_CONNECTION_REFUSED",
            "The wallet connection was refused.",
            409,
          )
        }

        const result = walletMockService.connectWallet(
          userId,
          walletIdResult.data,
          inputResult.data.provider,
          inputResult.data.network,
        )

        if (result.status === "not-found") {
          return createWalletErrorResponse(
            "WALLET_NOT_FOUND",
            "The selected wallet was not found.",
            404,
          )
        }

        if (result.status === "unsupported-network") {
          return createWalletErrorResponse(
            "WALLET_NETWORK_UNSUPPORTED",
            "The selected wallet does not support this network.",
            409,
          )
        }

        return HttpResponse.json(result.connection)
      },
    ),

    http.delete("/api/wallets/connection", async () => {
      await delay(walletResponseDelay)

      const userId = getAuthenticatedUserId()

      if (!userId) return createAuthenticationRequiredResponse()

      walletMockService.disconnectWallet(userId)

      return new HttpResponse(null, { status: 204 })
    }),
  ]
}
