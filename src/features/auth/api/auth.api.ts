import { httpClient } from "@/shared/api"

import { authEndpoints } from "./auth-endpoints"
import {
  authSessionSchema,
  loginInputSchema,
  registerInputSchema,
  type LoginInput,
  type RegisterInput,
} from "./auth.schemas"

async function login(input: LoginInput) {
  const body = loginInputSchema.parse(input)
  const response = await httpClient.post<unknown>(authEndpoints.login, body)

  return authSessionSchema.parse(response.data)
}

async function register(input: RegisterInput) {
  const body = registerInputSchema.parse(input)
  const response = await httpClient.post<unknown>(authEndpoints.register, body)

  return authSessionSchema.parse(response.data)
}

async function getSession(signal?: AbortSignal) {
  const response = await httpClient.get<unknown>(authEndpoints.session, {
    signal,
  })

  return authSessionSchema.parse(response.data)
}

async function logout(): Promise<void> {
  const response = await httpClient.delete(authEndpoints.session)

  if (response.status !== 204) {
    throw new Error("A resposta de logout deve ter status 204.")
  }
}

export const authApi = {
  getSession,
  login,
  logout,
  register,
}
