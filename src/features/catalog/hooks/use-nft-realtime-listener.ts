import { useEffect, useRef } from "react"

import type { NftUpdatedEvent } from "../realtime/nft-updated-event.schema"
import { nftRealtimeStore } from "../realtime/nft-realtime-store"

export function useNftRealtimeListener(
  listener: (event: NftUpdatedEvent) => void,
) {
  const listenerRef = useRef(listener)

  useEffect(() => {
    listenerRef.current = listener
  }, [listener])

  useEffect(
    () => nftRealtimeStore.subscribe((event) => listenerRef.current(event)),
    [],
  )
}
