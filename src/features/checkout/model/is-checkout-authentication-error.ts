import { getApiError } from "@/shared/api"

export function isCheckoutAuthenticationError(error: unknown) {
  const code = getApiError(error)?.code

  return code === "AUTH_REQUIRED" || code === "SESSION_EXPIRED"
}
