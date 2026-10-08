import { useCallback, useEffect, useRef } from "react"

import { isCheckoutAuthenticationError } from "../model/is-checkout-authentication-error"

interface UseCheckoutAuthenticationOptions {
  cartError: unknown
  hasSession: boolean
  isSessionResolved: boolean
  onAuthenticationRequired: () => void
  walletsError: unknown
}

export function useCheckoutAuthentication({
  cartError,
  hasSession,
  isSessionResolved,
  onAuthenticationRequired,
  walletsError,
}: UseCheckoutAuthenticationOptions) {
  const authenticationNotified = useRef(false)
  const notify = useCallback(() => {
    if (authenticationNotified.current) return

    authenticationNotified.current = true
    onAuthenticationRequired()
  }, [onAuthenticationRequired])

  useEffect(() => {
    if (!isSessionResolved) return

    if (!hasSession) {
      notify()
      return
    }

    authenticationNotified.current = false
  }, [hasSession, isSessionResolved, notify])

  useEffect(() => {
    const error = walletsError ?? cartError

    if (error && isCheckoutAuthenticationError(error)) notify()
  }, [cartError, notify, walletsError])

  return notify
}
