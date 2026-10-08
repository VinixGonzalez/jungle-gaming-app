const catalogInventoryStorageKey = "kurio_mock_catalog_inventory_v1"

interface CatalogInventoryState {
  version: 1
  purchasedQuantityByEditionId: Record<string, number>
  processedOrderIds: string[]
}

interface InventoryPurchaseItem {
  editionId: string
  quantity: number
}

let memoryState = createEmptyState()

function createEmptyState(): CatalogInventoryState {
  return {
    version: 1,
    purchasedQuantityByEditionId: {},
    processedOrderIds: [],
  }
}

function parseState(value: unknown): CatalogInventoryState | null {
  if (typeof value !== "object" || value === null) return null

  const state = value as Record<string, unknown>
  const quantities = state.purchasedQuantityByEditionId
  const orderIds = state.processedOrderIds

  if (
    state.version !== 1 ||
    typeof quantities !== "object" ||
    quantities === null ||
    Array.isArray(quantities) ||
    !Array.isArray(orderIds)
  ) {
    return null
  }

  const quantityEntries = Object.entries(quantities)

  if (
    quantityEntries.some(
      ([editionId, quantity]) =>
        editionId.length === 0 ||
        typeof quantity !== "number" ||
        !Number.isInteger(quantity) ||
        quantity < 0,
    ) ||
    orderIds.some(
      (orderId) => typeof orderId !== "string" || orderId.length === 0,
    )
  ) {
    return null
  }

  return {
    version: 1,
    purchasedQuantityByEditionId: Object.fromEntries(quantityEntries),
    processedOrderIds: [...orderIds] as string[],
  }
}

function getBrowserStorage() {
  try {
    return typeof window === "undefined" ? null : window.localStorage
  } catch {
    return null
  }
}

function readState(): CatalogInventoryState {
  const storage = getBrowserStorage()

  if (!storage) return memoryState

  try {
    const serializedState = storage.getItem(catalogInventoryStorageKey)

    if (!serializedState) return createEmptyState()

    const result = parseState(JSON.parse(serializedState))

    if (result) {
      memoryState = result
      return result
    }

    storage.removeItem(catalogInventoryStorageKey)
  } catch {
    try {
      storage.removeItem(catalogInventoryStorageKey)
    } catch {
      // An unavailable storage falls back to the in-memory mock state.
    }
  }

  memoryState = createEmptyState()
  return memoryState
}

function writeState(state: CatalogInventoryState) {
  const storage = getBrowserStorage()

  memoryState = state

  if (!storage) return

  try {
    storage.setItem(catalogInventoryStorageKey, JSON.stringify(state))
  } catch {
    // The mock remains usable with the in-memory state.
  }
}

export const catalogInventoryStorage = {
  readPurchasedQuantities() {
    return { ...readState().purchasedQuantityByEditionId }
  },

  purchase(
    orderId: string,
    items: readonly InventoryPurchaseItem[],
    initialAvailableQuantityByEditionId: ReadonlyMap<string, number>,
  ) {
    const state = readState()

    if (state.processedOrderIds.includes(orderId)) {
      return { status: "already-purchased" } as const
    }

    const requestedQuantityByEditionId = items.reduce((quantities, item) => {
      quantities.set(
        item.editionId,
        (quantities.get(item.editionId) ?? 0) + item.quantity,
      )

      return quantities
    }, new Map<string, number>())

    for (const [editionId, requestedQuantity] of requestedQuantityByEditionId) {
      const initialAvailableQuantity =
        initialAvailableQuantityByEditionId.get(editionId)
      const purchasedQuantity =
        state.purchasedQuantityByEditionId[editionId] ?? 0

      if (
        initialAvailableQuantity === undefined ||
        requestedQuantity > initialAvailableQuantity - purchasedQuantity
      ) {
        return { status: "unavailable" } as const
      }
    }

    const purchasedQuantityByEditionId = {
      ...state.purchasedQuantityByEditionId,
    }

    for (const [editionId, requestedQuantity] of requestedQuantityByEditionId) {
      purchasedQuantityByEditionId[editionId] =
        (purchasedQuantityByEditionId[editionId] ?? 0) + requestedQuantity
    }

    writeState({
      version: 1,
      purchasedQuantityByEditionId,
      processedOrderIds: [...state.processedOrderIds, orderId],
    })

    return { status: "purchased" } as const
  },
}
