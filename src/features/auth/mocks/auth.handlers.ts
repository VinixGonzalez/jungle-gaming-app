import { delay, http, HttpResponse } from "msw"

import {
  mockScenarioCookieName,
  resolveMockScenario,
} from "@/shared/mocks"
import { mockApi } from "@/shared/mocks"

import { authEndpoints } from "../api/auth-endpoints"
import {
  loginInputSchema,
  registerInputSchema,
} from "../api/auth.schemas"
import { authMockService } from "./auth-mock.service"

const AUTH_RESPONSE_DELAY = 50

function createAuthErrorResponse(
  code: string,
  message: string,
  status: number,
  fieldErrors?: Record<string, string[]>,
) {
  return mockApi.createErrorResponse(code, message, status, { fieldErrors })
}

function createInvalidRequestResponse(
  issues: readonly { path: PropertyKey[]; message: string }[],
) {
  return createAuthErrorResponse(
    "INVALID_AUTH_REQUEST",
    "The authentication request body is invalid.",
    400,
    mockApi.createFieldErrors(issues),
  )
}

function getScenario(cookies: Record<string, string | undefined>) {
  return resolveMockScenario(
    cookies[mockScenarioCookieName],
    import.meta.env.VITE_MOCK_SCENARIO,
  )
}

interface AuthHandlerDependencies {
  onAuthenticated: (userId: string) => void
}

export function createAuthHandlers({
  onAuthenticated,
}: AuthHandlerDependencies) {
  return [
    http.post(`/api${authEndpoints.register}`, async ({ request }) => {
      await delay(AUTH_RESPONSE_DELAY)

      const inputResult = registerInputSchema.safeParse(
        await mockApi.readJson(request),
      )

      if (!inputResult.success) {
        return createInvalidRequestResponse(inputResult.error.issues)
      }

      const result = await authMockService.register(inputResult.data)

      if (result.status === "email-conflict") {
        return createAuthErrorResponse(
          "EMAIL_ALREADY_EXISTS",
          "An account already exists for this email.",
          409,
          { email: ["An account already exists for this email."] },
        )
      }

      if (result.status === "username-conflict") {
        return createAuthErrorResponse(
          "USERNAME_ALREADY_EXISTS",
          "This username is already in use.",
          409,
          { username: ["This username is already in use."] },
        )
      }

      onAuthenticated(result.session.user.id)

      return HttpResponse.json(result.session, { status: 201 })
    }),

    http.post(`/api${authEndpoints.login}`, async ({ request }) => {
      await delay(AUTH_RESPONSE_DELAY)

      const inputResult = loginInputSchema.safeParse(
        await mockApi.readJson(request),
      )

      if (!inputResult.success) {
        return createInvalidRequestResponse(inputResult.error.issues)
      }

      const result = await authMockService.login(inputResult.data)

      if (result.status === "invalid-credentials") {
        return createAuthErrorResponse(
          "INVALID_CREDENTIALS",
          "The email or password is invalid.",
          401,
        )
      }

      onAuthenticated(result.session.user.id)

      return HttpResponse.json(result.session)
    }),

    http.get(`/api${authEndpoints.session}`, async ({ cookies }) => {
      await delay(AUTH_RESPONSE_DELAY)

      if (getScenario(cookies) === "auth-session-expired") {
        authMockService.expireSession()
        authMockService.getSession()
        return createAuthErrorResponse(
          "SESSION_EXPIRED",
          "The session has expired.",
          401,
        )
      }

      const result = authMockService.getSession()

      if (result.status === "expired") {
        return createAuthErrorResponse(
          "SESSION_EXPIRED",
          "The session has expired.",
          401,
        )
      }

      if (result.status === "missing") {
        return createAuthErrorResponse(
          "AUTH_REQUIRED",
          "Authentication is required.",
          401,
        )
      }

      onAuthenticated(result.session.user.id)

      return HttpResponse.json(result.session)
    }),

    http.delete(`/api${authEndpoints.session}`, async ({ cookies }) => {
      await delay(AUTH_RESPONSE_DELAY)

      if (getScenario(cookies) === "auth-logout-error") {
        return createAuthErrorResponse(
          "AUTH_LOGOUT_UNAVAILABLE",
          "The session could not be closed.",
          503,
        )
      }

      authMockService.logout()

      return new HttpResponse(null, { status: 204 })
    }),
  ]
}
