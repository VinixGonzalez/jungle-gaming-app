import type { QueryClient } from "@tanstack/react-query"

const rootKey = ["identity"] as const

export const identityQueryCache = {
  rootKey,

  async clear(queryClient: QueryClient) {
    await queryClient.cancelQueries({ queryKey: rootKey })
    queryClient.removeQueries({ queryKey: rootKey })

    const mutationCache = queryClient.getMutationCache()
    const completedMutations = mutationCache
      .findAll({ mutationKey: rootKey })
      .filter((mutation) => mutation.state.status !== "pending")

    completedMutations.forEach((mutation) => mutationCache.remove(mutation))
  },
}
