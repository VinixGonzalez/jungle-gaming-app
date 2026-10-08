import { useCallback, useMemo, useState } from "react"

import { useAddFavoriteMutation } from "./use-add-favorite-mutation"
import { useFavoritesQuery } from "./use-favorites-query"
import { useRemoveFavoriteMutation } from "./use-remove-favorite-mutation"

type FavoriteFeedback = {
  kind: "error" | "status"
  message: string
} | null

export function useFavoritesController(userId?: string) {
  const ownerId = userId ?? "anonymous"
  const favorites = useFavoritesQuery(userId)
  const addMutation = useAddFavoriteMutation(ownerId)
  const removeMutation = useRemoveFavoriteMutation(ownerId)
  const [mutationFeedback, setMutationFeedback] =
    useState<FavoriteFeedback>(null)
  const favoriteIds = favorites.data?.ids
  const addFavorite = addMutation.mutateAsync
  const removeFavorite = removeMutation.mutateAsync
  const resetAddMutation = addMutation.reset
  const resetRemoveMutation = removeMutation.reset

  const isFavorite = useCallback(
    (nftId: string) => favoriteIds?.includes(nftId) ?? false,
    [favoriteIds],
  )

  const toggle = useCallback(async (nftId: string) => {
    if (!userId || favorites.isError) return false

    setMutationFeedback(null)
    resetAddMutation()
    resetRemoveMutation()

    const wasFavorite = isFavorite(nftId)

    try {
      if (wasFavorite) {
        await removeFavorite(nftId)
      } else {
        await addFavorite(nftId)
      }

      setMutationFeedback({
        kind: "status",
        message: wasFavorite
          ? "NFT removido dos favoritos."
          : "NFT adicionado aos favoritos.",
      })
      return true
    } catch {
      setMutationFeedback({
        kind: "error",
        message: "Não foi possível atualizar os favoritos. Tente novamente.",
      })
      return false
    }
  }, [
    addFavorite,
    favorites.isError,
    isFavorite,
    removeFavorite,
    resetAddMutation,
    resetRemoveMutation,
    userId,
  ])

  const queryFeedback = useMemo<FavoriteFeedback>(
    () =>
      favorites.isError
        ? {
            kind: "error",
            message: "Não foi possível carregar os favoritos.",
          }
        : null,
    [favorites.isError],
  )

  return {
    feedback: mutationFeedback ?? queryFeedback,
    isDisabled: Boolean(userId) && favorites.isError,
    isFavorite,
    isPending:
      (Boolean(userId) && favorites.isPending) ||
      addMutation.isPending ||
      removeMutation.isPending,
    items: favorites.data?.items ?? [],
    queryError: favorites.isError,
    queryPending: Boolean(userId) && favorites.isPending,
    retry: favorites.refetch,
    toggle,
  }
}
