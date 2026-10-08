import { z } from "zod"

const realtimeMockStorageKey = "kurio_mock_realtime_v1"

const realtimeMockStateSchema = z.object({
  interruptedOrderIds: z.array(z.string().min(1)),
  version: z.literal(1),
})

function createEmptyState(): z.infer<typeof realtimeMockStateSchema> {
  return { interruptedOrderIds: [], version: 1 }
}

function readState() {
  try {
    const serializedState = localStorage.getItem(realtimeMockStorageKey)

    if (!serializedState) return createEmptyState()

    const result = realtimeMockStateSchema.safeParse(JSON.parse(serializedState))

    if (result.success) return result.data

    localStorage.removeItem(realtimeMockStorageKey)
  } catch {
    // The mock continues with an empty deterministic state.
  }

  return createEmptyState()
}

export const realtimeMockStorage = {
  consumeOrderInterruption(orderId: string) {
    const state = readState()

    if (state.interruptedOrderIds.includes(orderId)) return false

    try {
      localStorage.setItem(
        realtimeMockStorageKey,
        JSON.stringify(
          realtimeMockStateSchema.parse({
            ...state,
            interruptedOrderIds: [...state.interruptedOrderIds, orderId],
          }),
        ),
      )
    } catch {
      // The in-page test scenario can still close the connection once.
    }

    return true
  },
}
