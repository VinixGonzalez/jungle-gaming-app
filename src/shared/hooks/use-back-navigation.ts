import { useCallback } from "react"
import { useLocation, useNavigate } from "@tanstack/react-router"

export function useBackNavigation() {
  const location = useLocation()
  const navigate = useNavigate()

  return useCallback(() => {
    if (location.state.__TSR_index > 0) {
      window.history.back()
      return
    }

    void navigate({ to: "/" })
  }, [location.state.__TSR_index, navigate])
}
