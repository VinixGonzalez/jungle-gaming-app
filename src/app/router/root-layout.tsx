import { lazy, Suspense, useEffect, useState } from "react"
import { Outlet } from "@tanstack/react-router"

const RealtimeProvider = lazy(() =>
  import("@/app/providers/realtime-provider").then((module) => ({
    default: module.RealtimeProvider,
  })),
)

export function RootLayout() {
  const [canStartRealtime, setCanStartRealtime] = useState(false)

  useEffect(() => {
    let idleCallbackId: number | undefined
    let fallbackTimeoutId: number | undefined
    let startTimeoutId: number | undefined

    function startWhenIdle() {
      if ("requestIdleCallback" in window) {
        idleCallbackId = window.requestIdleCallback(
          () => setCanStartRealtime(true),
          { timeout: 2_000 },
        )
        return
      }

      fallbackTimeoutId = globalThis.setTimeout(
        () => setCanStartRealtime(true),
      )
    }

    function scheduleRealtime() {
      startTimeoutId = globalThis.setTimeout(startWhenIdle, 1_000)
    }

    if (document.readyState === "complete") scheduleRealtime()
    else window.addEventListener("load", scheduleRealtime, { once: true })

    return () => {
      window.removeEventListener("load", scheduleRealtime)
      if (idleCallbackId !== undefined) window.cancelIdleCallback(idleCallbackId)
      if (fallbackTimeoutId !== undefined) {
        window.clearTimeout(fallbackTimeoutId)
      }
      if (startTimeoutId !== undefined) window.clearTimeout(startTimeoutId)
    }
  }, [])

  return (
    <>
      <Outlet />
      {canStartRealtime ? (
        <Suspense fallback={null}>
          <RealtimeProvider />
        </Suspense>
      ) : null}
    </>
  )
}
