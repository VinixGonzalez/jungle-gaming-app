import { useEffect } from "react"

import { realtimeClient } from "@/shared/realtime"

export function useNftRealtimeSubscriptions(nftIds: readonly string[]) {
  const subscriptionKey = [...new Set(nftIds)].sort().join("|")

  useEffect(() => {
    if (!subscriptionKey) return

    const unsubscribe = subscriptionKey
      .split("|")
      .map((nftId) => realtimeClient.subscribeToNft(nftId))

    return () => {
      unsubscribe.forEach((release) => release())
    }
  }, [subscriptionKey])
}
