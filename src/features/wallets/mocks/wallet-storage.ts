import { z } from "zod"

import {
  walletConnectionSchema,
  walletSchema,
} from "../api/wallet.schemas"
import { walletFixtures } from "./wallet.fixtures"

const walletStorageKey = "kurio_mock_wallets_v1"

const storedWalletUserStateSchema = z.object({
  wallets: z.array(walletSchema),
  connection: walletConnectionSchema.nullable(),
})

const storedWalletStateSchema = z.object({
  usersById: z.record(z.string().min(1), storedWalletUserStateSchema),
})

type StoredWalletState = z.infer<typeof storedWalletStateSchema>
type StoredWalletUserState = z.infer<typeof storedWalletUserStateSchema>

function createEmptyState(): StoredWalletState {
  return { usersById: {} }
}

function createUserState(userId: string): StoredWalletUserState {
  return {
    wallets: walletFixtures.getByUserId(userId),
    connection: null,
  }
}

function getBrowserStorage() {
  try {
    return typeof window === "undefined" ? null : window.localStorage
  } catch {
    return null
  }
}

function readState(): StoredWalletState {
  const storage = getBrowserStorage()

  if (!storage) return createEmptyState()

  try {
    const serializedState = storage.getItem(walletStorageKey)

    if (!serializedState) return createEmptyState()

    const result = storedWalletStateSchema.safeParse(
      JSON.parse(serializedState),
    )

    if (result.success) return result.data

    storage.removeItem(walletStorageKey)
  } catch {
    try {
      storage.removeItem(walletStorageKey)
    } catch {
      // The mock falls back to its fixtures when storage is unavailable.
    }
  }

  return createEmptyState()
}

function writeState(state: StoredWalletState) {
  const parsedState = storedWalletStateSchema.parse(state)
  const storage = getBrowserStorage()

  if (!storage) return

  try {
    storage.setItem(walletStorageKey, JSON.stringify(parsedState))
  } catch {
    // The mock remains usable when browser storage is unavailable.
  }
}

export const walletMockStorage = {
  read(userId: string) {
    return readState().usersById[userId] ?? createUserState(userId)
  },

  write(userId: string, userState: StoredWalletUserState) {
    const parsedUserState = storedWalletUserStateSchema.parse(userState)
    const state = readState()

    writeState({
      usersById: {
        ...state.usersById,
        [userId]: parsedUserState,
      },
    })
  },
}
