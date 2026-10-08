import { httpClient } from "@/shared/api"

import {
  favoriteNftIdSchema,
  favoritesResponseSchema,
} from "./favorite.schemas"

async function getFavorites(signal?: AbortSignal) {
  const response = await httpClient.get<unknown>("/favorites", { signal })

  return favoritesResponseSchema.parse(response.data)
}

async function addFavorite(nftId: string) {
  const parsedNftId = favoriteNftIdSchema.parse(nftId)
  const response = await httpClient.put<unknown>(
    `/favorites/${encodeURIComponent(parsedNftId)}`,
  )

  return favoritesResponseSchema.parse(response.data)
}

async function removeFavorite(nftId: string) {
  const parsedNftId = favoriteNftIdSchema.parse(nftId)
  const response = await httpClient.delete<unknown>(
    `/favorites/${encodeURIComponent(parsedNftId)}`,
  )

  return favoritesResponseSchema.parse(response.data)
}

export const favoritesApi = {
  add: addFavorite,
  get: getFavorites,
  remove: removeFavorite,
}
