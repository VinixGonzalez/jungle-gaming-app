import { apiErrorSchema } from "@/shared/schemas"
import { isHttpClientError } from "./is-http-client-error"

export function getApiError(error: unknown) {
  if (!isHttpClientError(error)) return null

  const result = apiErrorSchema.safeParse(error.response?.data)

  return result.success ? result.data.error : null
}
