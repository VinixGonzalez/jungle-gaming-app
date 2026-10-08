import { useEffect } from "react"

export function usePageTitle(title: string | undefined) {
  useEffect(() => {
    if (!title) return

    const previousTitle = document.title
    document.title = title

    return () => {
      document.title = previousTitle
    }
  }, [title])
}
