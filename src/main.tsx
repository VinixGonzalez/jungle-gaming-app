import { canPrimeInitialMockCache } from "@/app/mocks/can-prime-initial-mock-cache"
import { renderApp } from "@/app/render-app"
import { startMockWorker } from "@/app/mocks/start-mock-worker"
import { preloadInitialRoute } from "@/app/router/preload-initial-route"

async function startMocks() {
  if (import.meta.env.VITE_ENABLE_MSW === "false") return

  await startMockWorker()
}

async function bootstrap() {
  const initialRouteReady = preloadInitialRoute()
  const canDeferMockWorker =
    import.meta.env.VITE_ENABLE_MSW !== "false" &&
    canPrimeInitialMockCache() &&
    sessionStorage.getItem("mock-service-ready") !== "true"
  const mockWorkerReady = canDeferMockWorker ? null : startMocks()

  try {
    if (mockWorkerReady) await mockWorkerReady
  } catch (error) {
    console.error("Failed to start the application.", error)
  }

  renderApp()

  void initialRouteReady.catch((error: unknown) => {
    console.error("Failed to preload the initial route.", error)
  })

  const reportMockError = (error: unknown) => {
    console.error("Failed to start the mock service.", error)
  }

  if (mockWorkerReady) {
    return
  }

  globalThis.setTimeout(() => {
    void startMocks().catch(reportMockError)
  }, 250)
}

void bootstrap()
