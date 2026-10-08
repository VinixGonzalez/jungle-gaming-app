import { lazy, Suspense, useEffect, useState } from "react"

const AccountNavigationAction = lazy(() =>
  import("./account-navigation-action").then((module) => ({
    default: module.AccountNavigationAction,
  })),
)

interface DeferredAccountNavigationActionProps {
  returnTo: string
  variant: "desktop" | "mobile"
}

function AccountNavigationPlaceholder({
  variant,
}: Pick<DeferredAccountNavigationActionProps, "variant">) {
  return (
    <span
      aria-hidden="true"
      className={
        variant === "desktop"
          ? "block h-8.75 w-25"
          : "block size-11 rounded-full"
      }
    />
  )
}

export function DeferredAccountNavigationAction({
  returnTo,
  variant,
}: DeferredAccountNavigationActionProps) {
  const [canLoad, setCanLoad] = useState(false)

  useEffect(() => {
    const timeoutId = globalThis.setTimeout(() => setCanLoad(true), 500)

    return () => globalThis.clearTimeout(timeoutId)
  }, [])

  if (!canLoad) return <AccountNavigationPlaceholder variant={variant} />

  return (
    <Suspense fallback={<AccountNavigationPlaceholder variant={variant} />}>
      <AccountNavigationAction returnTo={returnTo} variant={variant} />
    </Suspense>
  )
}
