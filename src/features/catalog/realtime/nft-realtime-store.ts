import type { NftUpdatedEvent } from "./nft-updated-event.schema"

const listeners = new Set<(event: NftUpdatedEvent) => void>()
let latestEvent: NftUpdatedEvent | null = null

export const nftRealtimeStore = {
  getSnapshot() {
    return latestEvent
  },
  publish(event: NftUpdatedEvent) {
    latestEvent = event
    listeners.forEach((listener) => listener(event))
  },
  subscribe(listener: (event: NftUpdatedEvent) => void) {
    listeners.add(listener)

    return () => {
      listeners.delete(listener)
    }
  },
}
