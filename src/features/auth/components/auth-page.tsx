import { useRef, useState } from "react"
import { useLocation, useNavigate } from "@tanstack/react-router"

import { Dialog } from "@/shared/components/ui/dialog"
import { usePageTitle } from "@/shared/hooks"
import { cn } from "@/shared/utils"

import { getSafeReturnTo } from "../model/get-safe-return-to"
import { AuthPanel } from "./auth-panel"

interface AuthPageProps {
  mode: "login" | "register"
  returnTo?: string
}

function canReturnThroughHistory(
  returnTo: string,
  authReturnTo?: string,
  authCanGoBack?: boolean,
) {
  if (
    authCanGoBack &&
    authReturnTo === returnTo &&
    window.history.length > 1
  ) {
    return true
  }

  if (!document.referrer || window.history.length <= 1) return false

  try {
    const referrer = new URL(document.referrer)
    const destination = new URL(returnTo, window.location.origin)

    return (
      referrer.origin === window.location.origin &&
      referrer.pathname === destination.pathname &&
      referrer.search === destination.search
    )
  } catch {
    return false
  }
}

export function AuthPage({ mode, returnTo }: AuthPageProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const isLeavingRef = useRef(false)
  const [isOpen, setIsOpen] = useState(true)
  const location = useLocation()
  const navigate = useNavigate()
  const safeReturnTo = getSafeReturnTo(returnTo)

  usePageTitle(mode === "login" ? "Entrar | Kurio" : "Criar conta | Kurio")

  function leaveAuth(destination: "home" | "return-to") {
    if (isLeavingRef.current) return

    isLeavingRef.current = true
    setIsOpen(false)

    if (
      canReturnThroughHistory(
        safeReturnTo,
        location.state.authReturnTo,
        location.state.authCanGoBack,
      )
    ) {
      window.history.back()
      return
    }

    const href = destination === "return-to" ? safeReturnTo : "/"

    void navigate({ href, replace: true }).catch(() => {
      isLeavingRef.current = false
      setIsOpen(true)
    })
  }

  return (
    <Dialog
      onOpenChange={(isOpen) => {
        if (!isOpen) leaveAuth("home")
      }}
      open={isOpen}
    >
      <Dialog.Content
        className={cn(
          "inset-0 top-0 left-0 h-svh w-full max-w-none translate-x-0 translate-y-0 overflow-y-auto rounded-shell border-0 bg-ink p-0 shadow-none xl:inset-auto xl:left-1/2 xl:w-125 xl:max-w-125 xl:-translate-x-1/2 xl:bg-surface-card xl:shadow-overlay",
          mode === "login"
            ? "xl:top-[clamp(1rem,calc((100svh_-_37.5rem)/2),10rem)] xl:h-150 xl:max-h-[calc(100svh_-_2rem)] xl:rounded-none"
            : "xl:top-[clamp(1rem,calc((100svh_-_41rem)/2),9.875rem)] xl:h-164 xl:max-h-[calc(100svh_-_2rem)] xl:rounded-lg",
        )}
        onOpenAutoFocus={(event) => {
          event.preventDefault()
          requestAnimationFrame(() => {
            contentRef.current
              ?.querySelector<HTMLElement>("[data-auth-autofocus]")
              ?.focus()
          })
        }}
        ref={contentRef}
        overlayClassName="bg-transparent"
        showCloseButton={false}
      >
        <AuthPanel
          mode={mode}
          onClose={() => leaveAuth("home")}
          onSuccess={() => leaveAuth("return-to")}
          returnTo={safeReturnTo}
        />
      </Dialog.Content>
    </Dialog>
  )
}
