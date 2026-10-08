import { useQuery } from "@tanstack/react-query"

import { favoritesApi } from "../api/favorites.api"
import { favoritesQueryKeys } from "../query/favorites-query-keys"

export function useFavoritesQuery(ownerId?: string) {
  return useQuery({
    enabled: Boolean(ownerId),
    queryKey: favoritesQueryKeys.byOwner(ownerId ?? "anonymous"),
    queryFn: ({ signal }) => favoritesApi.get(signal),
  })
}
