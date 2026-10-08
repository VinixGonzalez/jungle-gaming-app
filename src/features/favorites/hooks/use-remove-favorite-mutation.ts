import { useMutation, useQueryClient } from "@tanstack/react-query"

import { favoritesApi } from "../api/favorites.api"
import { favoriteMutationCache } from "../query/favorite-mutation-cache"
import { favoritesQueryKeys } from "../query/favorites-query-keys"

export function useRemoveFavoriteMutation(userId: string) {
  const queryClient = useQueryClient()
  const queryKey = favoritesQueryKeys.byOwner(userId)

  return useMutation({
    mutationKey: [...queryKey, "remove"],
    mutationFn: favoritesApi.remove,
    onMutate: async (nftId) => ({
      previous: await favoriteMutationCache.remove(
        queryClient,
        queryKey,
        nftId,
      ),
    }),
    onError: (_error, _nftId, context) => {
      favoriteMutationCache.restore(
        queryClient,
        queryKey,
        context?.previous,
      )
    },
    onSuccess: (favorites) => {
      favoriteMutationCache.replace(queryClient, queryKey, favorites)
    },
    scope: favoriteMutationCache.scope,
  })
}
