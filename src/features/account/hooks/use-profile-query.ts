import { useQuery } from "@tanstack/react-query"

import { accountApi } from "../api/account.api"
import { accountQueryKeys } from "../query/account-query-keys"

export function useProfileQuery(userId?: string) {
  return useQuery({
    enabled: Boolean(userId),
    queryKey: accountQueryKeys.profile(userId ?? "anonymous"),
    queryFn: ({ signal }) => accountApi.getProfile(signal),
  })
}
