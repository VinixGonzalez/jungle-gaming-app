import { z } from "zod"

import { favoriteNftIdSchema } from "../api/favorite.schemas"
import { favoriteFixtures } from "./favorite.fixtures"

const favoriteStorageKey = "kurio_mock_favorites_v1"

const favoriteIdsSchema = z.array(favoriteNftIdSchema).max(100)
const storedFavoriteStateSchema = z.object({
  usersById: z.record(z.string().min(1), favoriteIdsSchema),
})

type StoredFavoriteState = z.infer<typeof storedFavoriteStateSchema>

function createEmptyState(): StoredFavoriteState {
  return { usersById: {} }
}

function getBrowserStorage() {
  try {
    return typeof window === "undefined" ? null : window.localStorage
  } catch {
    return null
  }
}

function readState(): StoredFavoriteState {
  const storage = getBrowserStorage()

  if (!storage) return createEmptyState()

  try {
    const serializedState = storage.getItem(favoriteStorageKey)

    if (!serializedState) return createEmptyState()

    const result = storedFavoriteStateSchema.safeParse(
      JSON.parse(serializedState),
    )

    if (result.success) return result.data

    storage.removeItem(favoriteStorageKey)
  } catch {
    try {
      storage.removeItem(favoriteStorageKey)
    } catch {
      // The mock falls back to its fixtures when storage is unavailable.
    }
  }

  return createEmptyState()
}

function writeState(state: StoredFavoriteState) {
  const storage = getBrowserStorage()

  if (!storage) return

  try {
    storage.setItem(
      favoriteStorageKey,
      JSON.stringify(storedFavoriteStateSchema.parse(state)),
    )
  } catch {
    // The mock remains usable when browser storage is unavailable.
  }
}

export const favoriteStorage = {
  read(userId: string) {
    return (
      readState().usersById[userId] ?? favoriteFixtures.getByUserId(userId)
    )
  },

  write(userId: string, favoriteIds: readonly string[]) {
    const state = readState()

    writeState({
      usersById: {
        ...state.usersById,
        [userId]: favoriteIdsSchema.parse(favoriteIds),
      },
    })
  },
}
