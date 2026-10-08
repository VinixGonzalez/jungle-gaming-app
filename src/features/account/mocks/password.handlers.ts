import { delay, http, HttpResponse } from "msw"

import { mockApi } from "@/shared/mocks"

import { changePasswordInputSchema } from "../api/account.schemas"
import type { AccountHandlerDependencies } from "./account-handler.dependencies"
import { accountHandlerHelpers } from "./account-handler.helpers"

export function createPasswordHandlers({
  auth,
}: AccountHandlerDependencies) {
  return [
    http.patch("/api/profile/password", async ({ cookies, request }) => {
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

      const inputResult = changePasswordInputSchema.safeParse(
        await mockApi.readJson(request),
      )

      if (!inputResult.success) {
        return accountHandlerHelpers.createInvalidRequestResponse(
          inputResult.error.issues,
        )
      }

      const result = await auth.changePassword(
        context.userId,
        inputResult.data.currentPassword,
        inputResult.data.newPassword,
      )

      if (result.status === "invalid-current-password") {
        return accountHandlerHelpers.createErrorResponse(
          "INVALID_CURRENT_PASSWORD",
          "The current password is invalid.",
          422,
          { currentPassword: ["The current password is invalid."] },
        )
      }

      if (result.status === "not-found") {
        return accountHandlerHelpers.createAuthenticationRequiredResponse()
      }

      return new HttpResponse(null, { status: 204 })
    }),
  ]
}
