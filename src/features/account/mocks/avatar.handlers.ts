import { delay, http, HttpResponse } from "msw"

import { mockApi } from "@/shared/mocks"

import { avatarInputSchema } from "../api/account.schemas"
import type { AccountHandlerDependencies } from "./account-handler.dependencies"
import { accountHandlerHelpers } from "./account-handler.helpers"

export function createAvatarHandlers({
  auth,
  wallets,
}: AccountHandlerDependencies) {
  return [
    http.put("/api/profile/avatar", async ({ cookies, request }) => {
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

      const inputResult = avatarInputSchema.safeParse(
        await mockApi.readJson(request),
      )

      if (!inputResult.success) {
        return accountHandlerHelpers.createInvalidRequestResponse(
          inputResult.error.issues,
        )
      }

      const result = auth.updateAvatar(
        context.userId,
        inputResult.data.dataUrl,
      )

      if (result.status === "not-found") {
        return accountHandlerHelpers.createAuthenticationRequiredResponse()
      }

      return HttpResponse.json(
        accountHandlerHelpers.createProfile(
          result.user,
          wallets.getWallets(context.userId),
        ),
      )
    }),

    http.delete("/api/profile/avatar", async ({ cookies }) => {
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

      const result = auth.updateAvatar(context.userId, null)

      if (result.status === "not-found") {
        return accountHandlerHelpers.createAuthenticationRequiredResponse()
      }

      return HttpResponse.json(
        accountHandlerHelpers.createProfile(
          result.user,
          wallets.getWallets(context.userId),
        ),
      )
    }),
  ]
}
