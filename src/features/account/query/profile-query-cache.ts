import type { QueryClient } from "@tanstack/react-query"

import {
  authSessionQueryOptions,
  type AuthSession,
} from "@/features/auth"

import type { CollectorProfile } from "../api/account.schemas"
import { accountQueryKeys } from "./account-query-keys"

export const profileQueryCache = {
  async cancel(queryClient: QueryClient) {
    await Promise.all([
      queryClient.cancelQueries({ queryKey: accountQueryKeys.root }),
      queryClient.cancelQueries({
        exact: true,
        queryKey: authSessionQueryOptions.queryKey,
      }),
    ])
  },
  replace(queryClient: QueryClient, profile: CollectorProfile) {
    queryClient.setQueryData(
      accountQueryKeys.profile(profile.id),
      profile,
    )
    queryClient.setQueryData<AuthSession | null>(
      authSessionQueryOptions.queryKey,
      (session) =>
        session
          ? {
              ...session,
              user: {
                ...session.user,
                avatarUrl: profile.avatarUrl,
                displayName: profile.displayName,
                email: profile.email,
                ensName: profile.ensName,
                username: profile.username,
              },
            }
          : session,
    )
  },
}
