import { favoriteNftIdSchema } from "../api/favorite.schemas"
import { favoriteStorage } from "./favorite-storage"

export const favoriteMockService = {
  getIds(userId: string) {
    return favoriteStorage.read(userId)
  },

  add(userId: string, nftId: string) {
    const parsedNftId = favoriteNftIdSchema.parse(nftId)
    const favoriteIds = favoriteStorage.read(userId)

    if (favoriteIds.includes(parsedNftId)) return "existing" as const

    favoriteStorage.write(userId, [...favoriteIds, parsedNftId])

    return "created" as const
  },

  remove(userId: string, nftId: string) {
    const parsedNftId = favoriteNftIdSchema.parse(nftId)
    const favoriteIds = favoriteStorage.read(userId)

    favoriteStorage.write(
      userId,
      favoriteIds.filter((favoriteId) => favoriteId !== parsedNftId),
    )
  },
}
