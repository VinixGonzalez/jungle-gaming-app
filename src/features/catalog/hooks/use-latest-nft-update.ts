import { useSyncExternalStore } from "react"

import { nftRealtimeStore } from "../realtime/nft-realtime-store"

export function useLatestNftUpdate() {
  return useSyncExternalStore(
    nftRealtimeStore.subscribe,
    nftRealtimeStore.getSnapshot,
    nftRealtimeStore.getSnapshot,
  )
}
