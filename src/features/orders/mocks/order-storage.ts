import { z } from "zod"

import { orderSchema, type Order } from "../api/order.schemas"

const orderStorageKey = "kurio_mock_orders_v1"

const idempotencyRecordSchema = z.object({
  fingerprint: z.string().min(1),
  orderId: z.string().min(1),
})

const orderStorageStateSchema = z.object({
  ordersByUserId: z.record(z.string().min(1), z.array(orderSchema)),
  idempotencyByUserId: z.record(
    z.string().min(1),
    z.record(z.string().min(1), idempotencyRecordSchema),
  ),
})

type OrderStorageState = z.infer<typeof orderStorageStateSchema>

function createEmptyState(): OrderStorageState {
  return { ordersByUserId: {}, idempotencyByUserId: {} }
}

function getBrowserStorage() {
  try {
    return typeof window === "undefined" ? null : window.localStorage
  } catch {
    return null
  }
}

function readState(): OrderStorageState {
  const storage = getBrowserStorage()

  if (!storage) return createEmptyState()

  try {
    const serializedState = storage.getItem(orderStorageKey)

    if (!serializedState) return createEmptyState()

    const result = orderStorageStateSchema.safeParse(
      JSON.parse(serializedState),
    )

    if (result.success) return result.data

    storage.removeItem(orderStorageKey)
  } catch {
    try {
      storage.removeItem(orderStorageKey)
    } catch {
      // An unavailable storage falls back to an empty mock state.
    }
  }

  return createEmptyState()
}

function writeState(state: OrderStorageState) {
  const storage = getBrowserStorage()

  if (!storage) return

  try {
    storage.setItem(
      orderStorageKey,
      JSON.stringify(orderStorageStateSchema.parse(state)),
    )
  } catch {
    // The mock remains usable when browser storage is unavailable.
  }
}

export const orderMockStorage = {
  find(userId: string, orderId: string) {
    return readState().ordersByUserId[userId]?.find(
      (order) => order.id === orderId,
    )
  },

  findIdempotencyRecord(userId: string, idempotencyKey: string) {
    return readState().idempotencyByUserId[userId]?.[idempotencyKey]
  },

  insert(
    userId: string,
    order: Order,
    idempotencyKey: string,
    fingerprint: string,
  ) {
    const parsedOrder = orderSchema.parse(order)
    const state = readState()

    writeState({
      ordersByUserId: {
        ...state.ordersByUserId,
        [userId]: [...(state.ordersByUserId[userId] ?? []), parsedOrder],
      },
      idempotencyByUserId: {
        ...state.idempotencyByUserId,
        [userId]: {
          ...(state.idempotencyByUserId[userId] ?? {}),
          [idempotencyKey]: { fingerprint, orderId: parsedOrder.id },
        },
      },
    })

    return parsedOrder
  },

  update(userId: string, order: Order) {
    const parsedOrder = orderSchema.parse(order)
    const state = readState()
    const orders = state.ordersByUserId[userId] ?? []

    if (!orders.some((candidate) => candidate.id === parsedOrder.id)) {
      return undefined
    }

    writeState({
      ...state,
      ordersByUserId: {
        ...state.ordersByUserId,
        [userId]: orders.map((candidate) =>
          candidate.id === parsedOrder.id ? parsedOrder : candidate,
        ),
      },
    })

    return parsedOrder
  },
}
