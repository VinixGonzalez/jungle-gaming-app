import { useQuery } from "@tanstack/react-query"

import { walletsApi } from "../api/wallet.api"
import { walletsQueryKeys } from "../query/wallets-query-keys"

export function useWalletsQuery(ownerId?: string) {
  return useQuery({
    queryKey: walletsQueryKeys.byOwner(ownerId ?? "anonymous"),
    queryFn: ({ signal }) => walletsApi.get(signal),
    enabled: Boolean(ownerId),
    staleTime: 0,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
  })
}
