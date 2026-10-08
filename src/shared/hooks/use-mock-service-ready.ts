import { useEffect, useState } from "react"

function getMockServiceReady() {
  return (
    import.meta.env.VITE_ENABLE_MSW === "false" ||
    document.documentElement.dataset.mockServiceReady === "true"
  )
}

export function useMockServiceReady() {
  const [isReady, setIsReady] = useState(getMockServiceReady)

  useEffect(() => {
    if (getMockServiceReady()) return

    const observer = new MutationObserver(() => {
      if (!getMockServiceReady()) return

      setIsReady(true)
      observer.disconnect()
    })

    observer.observe(document.documentElement, {
      attributeFilter: ["data-mock-service-ready"],
      attributes: true,
    })

    return () => observer.disconnect()
  }, [])

  return isReady
}
