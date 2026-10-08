import { lazy, Suspense } from "react"
import { Link } from "@tanstack/react-router"
import { LogIn, RefreshCw } from "lucide-react"

import profileIcon from "@/shared/assets/icons/navigation/profile.svg"
import { Button } from "@/shared/components/ui/button"
import { IconButton } from "@/shared/components/ui/icon-button"
import { Skeleton } from "@/shared/components/ui/skeleton"

import { useSession } from "../hooks/use-session"

interface AccountNavigationActionProps {
  returnTo: string
  variant: "desktop" | "mobile"
}

const mobileActionClassName =
  "grid size-11 place-items-center rounded-full bg-transparent outline-none transition-opacity hover:bg-transparent hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring"

const AuthenticatedAccountAction = lazy(() =>
  import("./authenticated-account-action").then((module) => ({
    default: module.AuthenticatedAccountAction,
  })),
)

function AccountNavigationSkeleton({
  variant,
}: Pick<AccountNavigationActionProps, "variant">) {
  return (
    <div aria-busy="true">
      <Skeleton
        className={
          variant === "desktop"
            ? "h-8.75 w-25 rounded-md"
            : "size-11 rounded-full"
        }
      />
      <span className="sr-only" role="status">
        Verificando sessão...
      </span>
    </div>
  )
}

export function AccountNavigationAction({
  returnTo,
  variant,
}: AccountNavigationActionProps) {
  const session = useSession()

  if (session.isPending) {
    return <AccountNavigationSkeleton variant={variant} />
  }

  if (session.isError) {
    if (variant === "mobile") {
      return (
        <IconButton
          className={mobileActionClassName}
          label="Tentar carregar a sessão novamente"
          onClick={() => void session.refetch()}
          variant="ghost"
        >
          <RefreshCw aria-hidden="true" className="size-5" />
        </IconButton>
      )
    }

    return (
      <Button
        className="h-8.75 w-25 gap-1 px-2 text-size-12"
        onClick={() => void session.refetch()}
        variant="outline"
      >
        <RefreshCw aria-hidden="true" className="size-4" />
        Tentar
      </Button>
    )
  }

  if (!session.data) {
    if (variant === "mobile") {
      return (
        <Link
          aria-label="Entrar"
          className={mobileActionClassName}
          search={{ returnTo }}
          state={{ authCanGoBack: true, authReturnTo: returnTo }}
          to="/login"
        >
          <img alt="" className="max-h-5 max-w-5 opacity-90" src={profileIcon} />
        </Link>
      )
    }

    return (
      <Button
        asChild
        className="h-8.75 w-25 gap-1 text-size-16 font-medium leading-normal"
      >
        <Link
          search={{ returnTo }}
          state={{ authCanGoBack: true, authReturnTo: returnTo }}
          to="/login"
        >
          <LogIn aria-hidden="true" className="size-5" />
          Entrar
        </Link>
      </Button>
    )
  }

  return (
    <Suspense fallback={<AccountNavigationSkeleton variant={variant} />}>
      <AuthenticatedAccountAction user={session.data.user} variant={variant} />
    </Suspense>
  )
}
