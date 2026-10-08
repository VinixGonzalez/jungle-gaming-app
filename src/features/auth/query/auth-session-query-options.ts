import { queryOptions } from "@tanstack/react-query"

import { getApiError } from "@/shared/api"
import { identityQueryCache } from "@/shared/query"

import { authApi } from "../api/auth.api"
import type { AuthSession } from "../api/auth.schemas"
import { authSessionQueryKey } from "./auth-session-query-key"

const minimumExpirationCheckInterval = 1_000

export const authSessionQueryOptions = queryOptions({
  queryKey: authSessionQueryKey,
  queryFn: async ({ client, signal }) => {
    const previousUserId = client.getQueryData<AuthSession | null>(
      authSessionQueryKey,
    )?.user.id

    try {
      const session = await authApi.getSession(signal)

      if (previousUserId !== session.user.id) {
        await identityQueryCache.clear(client)
      }

      return session
    } catch (error) {
      const apiError = getApiError(error)

      if (apiError?.code === "SESSION_EXPIRED") {
        await identityQueryCache.clear(client)
        return null
      }

      if (apiError?.code === "AUTH_REQUIRED") {
        if (client.getQueryData(authSessionQueryKey)) {
          await identityQueryCache.clear(client)
        }

        return null
      }

      throw error
    }
  },
  refetchInterval: ({ state }) => {
    if (!state.data) return false

    return Math.max(
      Date.parse(state.data.expiresAt) - Date.now(),
      minimumExpirationCheckInterval,
    )
  },
  refetchIntervalInBackground: true,
  refetchOnReconnect: "always",
  refetchOnWindowFocus: "always",
})
