import { delay, http, HttpResponse } from "msw"

import { mockApi } from "@/shared/mocks"

import { updateProfileInputSchema } from "../api/account.schemas"
import type { AccountHandlerDependencies } from "./account-handler.dependencies"
import { accountHandlerHelpers } from "./account-handler.helpers"

export function createProfileHandlers({
  auth,
  wallets,
}: AccountHandlerDependencies) {
  return [
    http.get("/api/profile", async ({ cookies }) => {
      await delay(accountHandlerHelpers.responseDelay)

      const context = accountHandlerHelpers.getAuthenticatedContext(auth)

      if (!context) {
        return accountHandlerHelpers.createAuthenticationRequiredResponse()
      }

      if (accountHandlerHelpers.isUnavailable(cookies)) {
        return accountHandlerHelpers.createErrorResponse(
          "PROFILE_UNAVAILABLE",
          "The profile service is temporarily unavailable.",
          503,
        )
      }

      return HttpResponse.json(
        accountHandlerHelpers.createProfile(
          context.user,
          wallets.getWallets(context.userId),
        ),
      )
    }),

    http.patch("/api/profile", async ({ cookies, request }) => {
      await delay(accountHandlerHelpers.responseDelay)

      const context = accountHandlerHelpers.getAuthenticatedContext(auth)

      if (!context) {
        return accountHandlerHelpers.createAuthenticationRequiredResponse()
      }

      if (accountHandlerHelpers.isUnavailable(cookies)) {
        return accountHandlerHelpers.createErrorResponse(
          "PROFILE_UNAVAILABLE",
          "The profile service is temporarily unavailable.",
          503,
        )
      }

      const inputResult = updateProfileInputSchema.safeParse(
        await mockApi.readJson(request),
      )

      if (!inputResult.success) {
        return accountHandlerHelpers.createInvalidRequestResponse(
          inputResult.error.issues,
        )
      }

      const currentWallets = wallets.getWallets(context.userId)
      const primaryWallet = currentWallets.wallets.find(
        (wallet) => wallet.role === "primary",
      )

      if (inputResult.data.walletAlias && !primaryWallet) {
        return accountHandlerHelpers.createErrorResponse(
          "PRIMARY_WALLET_REQUIRED",
          "Register a primary wallet before assigning an alias.",
          409,
          {
            walletAlias: [
              "Register a primary wallet before assigning an alias.",
            ],
          },
        )
      }

      if (primaryWallet && !inputResult.data.walletAlias) {
        return accountHandlerHelpers.createErrorResponse(
          "WALLET_ALIAS_REQUIRED",
          "The primary wallet alias is required.",
          422,
          { walletAlias: ["The primary wallet alias is required."] },
        )
      }

      const identityResult = auth.updateProfile(context.userId, {
        displayName: inputResult.data.displayName,
        email: inputResult.data.email,
        ensName: inputResult.data.ensName,
        username: inputResult.data.username,
      })

      if (identityResult.status === "email-conflict") {
        return accountHandlerHelpers.createErrorResponse(
          "EMAIL_ALREADY_EXISTS",
          "An account already exists for this email.",
          409,
          { email: ["An account already exists for this email."] },
        )
      }

      if (identityResult.status === "username-conflict") {
        return accountHandlerHelpers.createErrorResponse(
          "USERNAME_ALREADY_EXISTS",
          "This username is already in use.",
          409,
          { username: ["This username is already in use."] },
        )
      }

      if (identityResult.status === "not-found") {
        return accountHandlerHelpers.createAuthenticationRequiredResponse()
      }

      if (
        primaryWallet &&
        inputResult.data.walletAlias &&
        primaryWallet.label !== inputResult.data.walletAlias
      ) {
        const walletResult = wallets.updateWallet(
          context.userId,
          primaryWallet.id,
          { label: inputResult.data.walletAlias },
        )

        if (walletResult.status !== "success") {
          return accountHandlerHelpers.createErrorResponse(
            "PROFILE_UPDATE_CONFLICT",
            "The primary wallet could not be updated.",
            409,
            {
              walletAlias: [
                "The primary wallet could not be updated.",
              ],
            },
          )
        }
      }

      return HttpResponse.json(
        accountHandlerHelpers.createProfile(
          identityResult.user,
          wallets.getWallets(context.userId),
        ),
      )
    }),
  ]
}
