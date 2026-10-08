import type { QueryClient } from "@tanstack/react-query"

import { identityMutationScope } from "@/shared/query"

import type { FavoritesResponse } from "../api/favorite.schemas"

export const favoriteMutationCache = {
  scope: identityMutationScope,

  async add(
    queryClient: QueryClient,
    queryKey: readonly unknown[],
    nftId: string,
  ) {
    await queryClient.cancelQueries({ queryKey })
    const previous = queryClient.getQueryData<FavoritesResponse>(queryKey)

    if (previous && !previous.ids.includes(nftId)) {
      queryClient.setQueryData<FavoritesResponse>(queryKey, {
        ...previous,
        ids: [...previous.ids, nftId],
      })
    }

    return previous
  },

  async remove(
    queryClient: QueryClient,
    queryKey: readonly unknown[],
    nftId: string,
  ) {
    await queryClient.cancelQueries({ queryKey })
    const previous = queryClient.getQueryData<FavoritesResponse>(queryKey)

    if (previous) {
      queryClient.setQueryData<FavoritesResponse>(queryKey, {
        ids: previous.ids.filter((favoriteId) => favoriteId !== nftId),
        items: previous.items.filter((item) => item.id !== nftId),
      })
    }

    return previous
  },

  replace(
    queryClient: QueryClient,
    queryKey: readonly unknown[],
    favorites: FavoritesResponse,
  ) {
    queryClient.setQueryData(queryKey, favorites)
  },

  restore(
    queryClient: QueryClient,
    queryKey: readonly unknown[],
    previous?: FavoritesResponse,
  ) {
    if (previous) queryClient.setQueryData(queryKey, previous)
  },
}
