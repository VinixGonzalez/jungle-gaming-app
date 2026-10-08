export async function startMockWorker() {
  const { worker } = await import("./browser")

  await worker.start({
    onUnhandledRequest(request, print) {
      const { pathname } = new URL(request.url)

      if (pathname.startsWith("/api/")) {
        print.error()
      }
    },
    serviceWorker: {
      url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
    },
  })

  const registerDeferredHandlers = () =>
    import("./deferred-handlers").then(({ deferredHandlers }) => {
      worker.use(...deferredHandlers)
      sessionStorage.setItem("mock-service-ready", "true")
      document.documentElement.dataset.mockServiceReady = "true"
    })
  const pathname = window.location.pathname
  const usesOnlyCoreHandlers =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/cart" ||
    pathname.startsWith("/nfts/")

  if (sessionStorage.getItem("mock-service-ready") === "true") {
    await registerDeferredHandlers()
    return
  }

  if (usesOnlyCoreHandlers) {
    globalThis.setTimeout(() => {
      void registerDeferredHandlers().catch((error: unknown) => {
        console.error("Failed to register deferred mock handlers.", error)
      })
    }, 500)
    return
  }

  await registerDeferredHandlers()
}
