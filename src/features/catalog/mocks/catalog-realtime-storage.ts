import { isEthAmount, parseEthToWei } from "@/shared/utils"

const catalogRealtimeStorageKey = "kurio_mock_realtime_catalog_v1"

interface EditionAdjustment {
  availableQuantityReduction?: number
  editionId: string
  priceEth?: string
}

interface StoredEditionAdjustment extends EditionAdjustment {
  availableQuantityReduction: number
}

interface CatalogRealtimeUpdate {
  adjustments: StoredEditionAdjustment[]
  revision: number
}

interface CatalogRealtimeState {
  updatesByNftId: Record<string, CatalogRealtimeUpdate>
  version: 1
}

function createEmptyState(): CatalogRealtimeState {
  return { updatesByNftId: {}, version: 1 }
}

function parseAdjustment(value: unknown): StoredEditionAdjustment | null {
  if (typeof value !== "object" || value === null) return null

  const adjustment = value as Record<string, unknown>
  const reduction = adjustment.availableQuantityReduction ?? 0
  const priceEth = adjustment.priceEth

  if (
    typeof adjustment.editionId !== "string" ||
    adjustment.editionId.length === 0 ||
    typeof reduction !== "number" ||
    !Number.isInteger(reduction) ||
    reduction < 0 ||
    (priceEth !== undefined &&
      (typeof priceEth !== "string" ||
        !isEthAmount(priceEth) ||
        parseEthToWei(priceEth) <= 0n))
  ) {
    return null
  }

  return {
    availableQuantityReduction: reduction,
    editionId: adjustment.editionId,
    ...(typeof priceEth === "string" ? { priceEth } : {}),
  }
}

function parseUpdate(value: unknown): CatalogRealtimeUpdate | null {
  if (typeof value !== "object" || value === null) return null

  const update = value as Record<string, unknown>

  if (
    !Array.isArray(update.adjustments) ||
    update.adjustments.length === 0 ||
    typeof update.revision !== "number" ||
    !Number.isInteger(update.revision) ||
    update.revision <= 0
  ) {
    return null
  }

  const adjustments = update.adjustments.map(parseAdjustment)

  if (adjustments.some((adjustment) => adjustment === null)) return null

  return {
    adjustments: adjustments as StoredEditionAdjustment[],
    revision: update.revision,
  }
}

function parseState(value: unknown): CatalogRealtimeState | null {
  if (typeof value !== "object" || value === null) return null

  const state = value as Record<string, unknown>
  const updates = state.updatesByNftId

  if (
    state.version !== 1 ||
    typeof updates !== "object" ||
    updates === null ||
    Array.isArray(updates)
  ) {
    return null
  }

  const parsedUpdates = Object.entries(updates).map(([nftId, update]) => [
    nftId,
    parseUpdate(update),
  ] as const)

  if (
    parsedUpdates.some(
      ([nftId, update]) => nftId.length === 0 || update === null,
    )
  ) {
    return null
  }

  return {
    updatesByNftId: Object.fromEntries(parsedUpdates) as Record<
      string,
      CatalogRealtimeUpdate
    >,
    version: 1,
  }
}

function getBrowserStorage() {
  try {
    return typeof window === "undefined" ? null : window.localStorage
  } catch {
    return null
  }
}

function readState() {
  const storage = getBrowserStorage()

  if (!storage) return createEmptyState()

  try {
    const serializedState = storage.getItem(catalogRealtimeStorageKey)

    if (!serializedState) return createEmptyState()

    const state = parseState(JSON.parse(serializedState))

    if (state) return state

    storage.removeItem(catalogRealtimeStorageKey)
  } catch {
    try {
      storage.removeItem(catalogRealtimeStorageKey)
    } catch {
      // The mock continues with the known initial state.
    }
  }

  return createEmptyState()
}

function writeState(state: CatalogRealtimeState) {
  const storage = getBrowserStorage()

  if (!storage) return

  try {
    storage.setItem(catalogRealtimeStorageKey, JSON.stringify(state))
  } catch {
    // The mock remains usable when storage is unavailable.
  }
}

export const catalogRealtimeStorage = {
  apply(nftId: string, adjustments: readonly EditionAdjustment[]) {
    const state = readState()
    const currentUpdate = state.updatesByNftId[nftId]

    if (currentUpdate) return currentUpdate

    const parsedAdjustments = adjustments.map(parseAdjustment)

    if (
      nftId.length === 0 ||
      parsedAdjustments.length === 0 ||
      parsedAdjustments.some((adjustment) => adjustment === null)
    ) {
      throw new Error("Invalid catalog realtime update")
    }

    const update: CatalogRealtimeUpdate = {
      adjustments: parsedAdjustments as StoredEditionAdjustment[],
      revision: 1,
    }

    writeState({
      ...state,
      updatesByNftId: { ...state.updatesByNftId, [nftId]: update },
    })

    return update
  },
  read(nftId: string) {
    return readState().updatesByNftId[nftId] ?? null
  },
}
