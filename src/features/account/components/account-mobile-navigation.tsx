import { Link, useNavigate } from "@tanstack/react-router"
import { Heart, LogOut, MapPin, UserRound } from "lucide-react"

import { useLogoutMutation } from "@/features/auth"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/utils"

interface AccountMobileNavigationProps {
  activeItem: "favorites" | "profile" | "wallets"
}

export function AccountMobileNavigation({
  activeItem,
}: AccountMobileNavigationProps) {
  const logout = useLogoutMutation()
  const navigate = useNavigate()
  const linkClassName =
    "flex min-h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-md px-1 text-size-13 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring min-[360px]:px-2"

  async function signOut() {
    try {
      await logout.mutateAsync()
      await navigate({ to: "/", replace: true })
    } catch {
      // The inline status below keeps the action recoverable.
    }
  }

  return (
    <div className="mb-6 rounded-lg bg-surface-card p-2 xl:hidden">
      <nav aria-label="Minha conta" className="flex gap-1 min-[360px]:gap-2">
        <Link
          aria-label="Perfil"
          className={cn(
            linkClassName,
            activeItem === "profile"
              ? "bg-surface-raised font-bold text-text-accent"
              : "text-text-secondary",
          )}
          to="/profile"
          aria-current={activeItem === "profile" ? "page" : undefined}
        >
          <UserRound aria-hidden="true" className="size-4" />
          <span className="hidden min-[360px]:inline">Perfil</span>
        </Link>
        <Link
          aria-label="Carteiras"
          className={cn(
            linkClassName,
            activeItem === "wallets"
              ? "bg-surface-raised font-bold text-text-accent"
              : "text-text-secondary",
          )}
          to="/wallets"
          aria-current={activeItem === "wallets" ? "page" : undefined}
        >
          <MapPin aria-hidden="true" className="size-4" />
          <span className="hidden min-[360px]:inline">Carteiras</span>
        </Link>
        <Link
          aria-label="Favoritos"
          aria-current={activeItem === "favorites" ? "page" : undefined}
          className={cn(
            linkClassName,
            activeItem === "favorites"
              ? "bg-surface-raised font-bold text-text-accent"
              : "text-text-secondary",
          )}
          to="/favorites"
        >
          <Heart aria-hidden="true" className="size-4" />
          <span className="hidden min-[360px]:inline">Favoritos</span>
        </Link>
        <Button
          aria-label="Sair"
          className="size-11 text-text-accent"
          disabled={logout.isPending}
          onClick={() => void signOut()}
          size="icon-lg"
          type="button"
          variant="ghost"
        >
          <LogOut aria-hidden="true" className="size-5" />
        </Button>
      </nav>
      {logout.isError ? (
        <p className="px-2 pt-2 text-size-11 text-error-text" role="alert">
          Não foi possível sair. Tente novamente.
        </p>
      ) : null}
    </div>
  )
}
