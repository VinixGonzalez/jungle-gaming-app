import { useCallback, useRef } from "react"

export function useSingleFlight() {
  const isRunning = useRef(false)

  return useCallback(async <T>(task: () => Promise<T>) => {
    if (isRunning.current) return undefined

    isRunning.current = true

    try {
      return await task()
    } finally {
      isRunning.current = false
    }
  }, [])
}
