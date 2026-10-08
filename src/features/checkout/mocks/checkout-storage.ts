import { z } from "zod"

import { ethAmountSchema } from "@/shared/schemas"

import { checkoutQuoteSchema } from "../api/checkout.schemas"

const checkoutStorageKey = "kurio_mock_checkout_v1"

const storedQuoteSchema = z.object({
  quote: checkoutQuoteSchema,
  forceChangeOnRevalidation: z.boolean(),
  forceItemUnavailableOnRevalidation: z.boolean().default(false),
})

const storedCheckoutUserStateSchema = z.object({
  quotesById: z.record(z.string().min(1), storedQuoteSchema),
  quoteChangeScenarioConsumed: z.boolean().default(false),
  itemUnavailableScenarioConsumed: z.boolean().default(false),
  networkFeeAdjustmentEth: ethAmountSchema.nullable().default(null),
})

const storedCheckoutStateSchema = z.object({
  usersById: z.record(z.string().min(1), storedCheckoutUserStateSchema),
})

type StoredCheckoutState = z.infer<typeof storedCheckoutStateSchema>
type StoredCheckoutUserState = z.infer<
  typeof storedCheckoutUserStateSchema
>

function createEmptyState(): StoredCheckoutState {
  return { usersById: {} }
}

function createUserState(): StoredCheckoutUserState {
  return {
    quotesById: {},
    quoteChangeScenarioConsumed: false,
    itemUnavailableScenarioConsumed: false,
    networkFeeAdjustmentEth: null,
  }
}

function getBrowserStorage() {
  try {
    return typeof window === "undefined" ? null : window.localStorage
  } catch {
    return null
  }
}

function readState(): StoredCheckoutState {
  const storage = getBrowserStorage()

  if (!storage) return createEmptyState()

  try {
    const serializedState = storage.getItem(checkoutStorageKey)

    if (!serializedState) return createEmptyState()

    const result = storedCheckoutStateSchema.safeParse(
      JSON.parse(serializedState),
    )

    if (result.success) return result.data

    storage.removeItem(checkoutStorageKey)
  } catch {
    try {
      storage.removeItem(checkoutStorageKey)
    } catch {
      // The mock falls back to its fixtures when storage is unavailable.
    }
  }

  return createEmptyState()
}

function writeState(state: StoredCheckoutState) {
  const parsedState = storedCheckoutStateSchema.parse(state)
  const storage = getBrowserStorage()

  if (!storage) return

  try {
    storage.setItem(checkoutStorageKey, JSON.stringify(parsedState))
  } catch {
    // The mock remains usable when browser storage is unavailable.
  }
}

export const checkoutMockStorage = {
  read(userId: string) {
    return readState().usersById[userId] ?? createUserState()
  },

  write(userId: string, userState: StoredCheckoutUserState) {
    const parsedUserState = storedCheckoutUserStateSchema.parse(userState)
    const state = readState()

    writeState({
      usersById: {
        ...state.usersById,
        [userId]: parsedUserState,
      },
    })
  },
}
