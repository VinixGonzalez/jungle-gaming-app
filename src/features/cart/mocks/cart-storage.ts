import { z } from "zod"

const cartStorageKey = "kurio_mock_cart_v2"
const legacyCartStorageKey = "kurio_mock_cart_v1"

const storedCartItemSchema = z.object({
  nftId: z.string().min(1),
  editionId: z.string().min(1),
  quantity: z.number().int().positive(),
})

const storedCartSchema = z.object({
  items: z.array(storedCartItemSchema),
  couponCode: z.literal("LAUNCH10").nullable(),
})

const storedCartStateSchema = z.object({
  guestCart: storedCartSchema,
  cartsByUserId: z.record(z.string().min(1), storedCartSchema),
})

type StoredCart = z.infer<typeof storedCartSchema>
type StoredCartState = z.infer<typeof storedCartStateSchema>

function createEmptyCart(): StoredCart {
  return { items: [], couponCode: null }
}

function createEmptyState(): StoredCartState {
  return { guestCart: createEmptyCart(), cartsByUserId: {} }
}

function getBrowserStorage() {
  try {
    return typeof window === "undefined" ? null : window.localStorage
  } catch {
    return null
  }
}

function writeState(state: StoredCartState) {
  const parsedState = storedCartStateSchema.parse(state)
  const storage = getBrowserStorage()

  if (!storage) return

  try {
    storage.setItem(cartStorageKey, JSON.stringify(parsedState))
  } catch {
    // The mock remains usable when browser storage is unavailable.
  }
}

function migrateLegacyCart(storage: Storage): StoredCartState | null {
  const serializedCart = storage.getItem(legacyCartStorageKey)

  if (!serializedCart) return null

  try {
    const result = storedCartSchema.safeParse(JSON.parse(serializedCart))

    if (!result.success) {
      storage.removeItem(legacyCartStorageKey)
      return null
    }

    const migratedState: StoredCartState = {
      guestCart: result.data,
      cartsByUserId: {},
    }

    storage.setItem(cartStorageKey, JSON.stringify(migratedState))
    storage.removeItem(legacyCartStorageKey)

    return migratedState
  } catch {
    try {
      storage.removeItem(legacyCartStorageKey)
    } catch {
      // A malformed legacy value falls back to an empty mock state.
    }

    return null
  }
}

function readState(): StoredCartState {
  const storage = getBrowserStorage()

  if (!storage) return createEmptyState()

  try {
    const serializedState = storage.getItem(cartStorageKey)

    if (serializedState) {
      const result = storedCartStateSchema.safeParse(JSON.parse(serializedState))

      if (result.success) return result.data

      storage.removeItem(cartStorageKey)
    }

    return migrateLegacyCart(storage) ?? createEmptyState()
  } catch {
    try {
      storage.removeItem(cartStorageKey)
    } catch {
      // An unavailable storage falls back to the initial mock state.
      return createEmptyState()
    }

    return migrateLegacyCart(storage) ?? createEmptyState()
  }
}

export const cartMockStorage = {
  read(userId: string | null): StoredCart {
    const state = readState()

    return userId
      ? (state.cartsByUserId[userId] ?? createEmptyCart())
      : state.guestCart
  },

  write(userId: string | null, cart: StoredCart) {
    const parsedCart = storedCartSchema.parse(cart)
    const state = readState()

    writeState(
      userId
        ? {
            ...state,
            cartsByUserId: {
              ...state.cartsByUserId,
              [userId]: parsedCart,
            },
          }
        : { ...state, guestCart: parsedCart },
    )
  },

  claimGuestCart(
    userId: string,
    merge: (userCart: StoredCart, guestCart: StoredCart) => StoredCart,
  ) {
    const state = readState()

    if (
      state.guestCart.items.length === 0 &&
      state.guestCart.couponCode === null
    ) {
      return state.cartsByUserId[userId] ?? createEmptyCart()
    }

    const nextCart = storedCartSchema.parse(
      merge(
        state.cartsByUserId[userId] ?? createEmptyCart(),
        state.guestCart,
      ),
    )

    writeState({
      guestCart: createEmptyCart(),
      cartsByUserId: { ...state.cartsByUserId, [userId]: nextCart },
    })

    return nextCart
  },
}
