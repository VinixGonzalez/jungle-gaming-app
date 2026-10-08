import { z } from "zod"

import { authUserSchema } from "../api/auth.schemas"
import { authAccountFixtures } from "./auth.fixtures"
import { authStorageKey } from "./auth-storage-key"

const storedAuthAccountSchema = z.object({
  user: authUserSchema,
  passwordDigest: z.string().regex(/^[a-f0-9]{64}$/),
})

const storedAuthSessionSchema = z.object({
  userId: z.string().min(1),
  expiresAt: z.iso.datetime({ offset: true }),
})

const storedAuthStateSchema = z.object({
  accounts: z.array(storedAuthAccountSchema),
  session: storedAuthSessionSchema.nullable(),
})

type StoredAuthState = z.infer<typeof storedAuthStateSchema>

function createDefaultState(): StoredAuthState {
  return storedAuthStateSchema.parse({
    accounts: authAccountFixtures.map((account) => ({
      user: { ...account.user },
      passwordDigest: account.passwordDigest,
    })),
    session: null,
  })
}

function getBrowserStorage() {
  try {
    return typeof window === "undefined" ? null : window.localStorage
  } catch {
    return null
  }
}

export const authMockStorage = {
  read(): StoredAuthState {
    const storage = getBrowserStorage()

    if (!storage) return createDefaultState()

    try {
      const serializedState = storage.getItem(authStorageKey)

      if (!serializedState) return createDefaultState()

      const result = storedAuthStateSchema.safeParse(JSON.parse(serializedState))

      if (result.success) return result.data

      storage.removeItem(authStorageKey)
    } catch {
      try {
        storage.removeItem(authStorageKey)
      } catch {
        // An unavailable storage falls back to the initial mock state.
      }
    }

    return createDefaultState()
  },

  write(state: StoredAuthState) {
    const parsedState = storedAuthStateSchema.parse(state)
    const storage = getBrowserStorage()

    if (!storage) return

    try {
      storage.setItem(authStorageKey, JSON.stringify(parsedState))
    } catch {
      // The mock remains usable even when browser storage is unavailable.
    }
  },
}
