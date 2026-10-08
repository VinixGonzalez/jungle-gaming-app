import { useEffect } from "react"
import { useLocation, useNavigate } from "@tanstack/react-router"

import { getSafeReturnTo } from "../model/get-safe-return-to"
import { useSession } from "./use-session"

export function useRequireSession(returnTo: string) {
  const location = useLocation()
  const navigate = useNavigate()
  const session = useSession()
  const safeReturnTo = getSafeReturnTo(returnTo)

  useEffect(() => {
    if (location.pathname === "/login" || location.pathname === "/register") {
      return
    }

    if (!session.isSuccess || session.data) return

    void navigate({
      replace: true,
      search: { returnTo: safeReturnTo },
      state: { authCanGoBack: false, authReturnTo: safeReturnTo },
      to: "/login",
    })
  }, [location.pathname, navigate, safeReturnTo, session.data, session.isSuccess])

  return session
}
