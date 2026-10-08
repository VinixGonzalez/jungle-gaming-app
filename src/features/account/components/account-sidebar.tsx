import { Link, useNavigate } from "@tanstack/react-router"
import {
  Activity,
  Download,
  Heart,
  LogOut,
  MapPin,
  ShoppingCart,
  TriangleAlert,
  UserRound,
} from "lucide-react"

import { useLogoutMutation } from "@/features/auth"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/utils"

interface AccountSidebarProps {
  activeItem: "favorites" | "profile" | "wallets"
}

const unavailableItems = [
  { icon: ShoppingCart, label: "Atividade" },
  { icon: Activity, label: "Ofertas" },
  { icon: Download, label: "Arquivos baixados" },
  { icon: TriangleAlert, label: "Suporte" },
] as const

export function AccountSidebar({ activeItem }: AccountSidebarProps) {
  const logout = useLogoutMutation()
  const navigate = useNavigate()

  async function signOut() {
    try {
      await logout.mutateAsync()
      await navigate({ to: "/", replace: true })
    } catch {
      // The mutation feedback remains visible so the user can retry.
    }
  }

  const itemClassName =
    "flex h-11.25 w-full items-center gap-3 px-4 text-size-15 leading-size-45 text-text-accent outline-none transition-colors hover:bg-surface-raised focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"

  return (
    <aside
      aria-label="Minha conta"
      className="hidden w-77.5 shrink-0 bg-surface-card py-2 xl:block"
    >
      <h2 className="px-2.5 py-2.5 text-size-18 font-bold leading-size-16">
        Meu perfil
      </h2>
      <nav>
        <Link
          className={cn(
            itemClassName,
            activeItem === "profile" && "border-l-6 border-primary pl-2",
          )}
          to="/profile"
          aria-current={activeItem === "profile" ? "page" : undefined}
        >
          <UserRound aria-hidden="true" className="size-4.5" />
          Dados do perfil
        </Link>
        <Link
          className={cn(
            itemClassName,
            activeItem === "wallets" && "border-l-6 border-primary pl-2",
          )}
          to="/wallets"
          aria-current={activeItem === "wallets" ? "page" : undefined}
        >
          <MapPin aria-hidden="true" className="size-5" />
          Carteiras
        </Link>
        <Link
          aria-current={activeItem === "favorites" ? "page" : undefined}
          className={cn(
            itemClassName,
            activeItem === "favorites" && "border-l-6 border-primary pl-2",
          )}
          to="/favorites"
        >
          <Heart aria-hidden="true" className="size-4.5" />
          Lista de interesse
        </Link>

        {unavailableItems.map(({ icon: Icon, label }) => (
          <span
            aria-disabled="true"
            className={cn(itemClassName, "cursor-not-allowed opacity-55")}
            key={label}
            title="Fora do escopo deste desafio"
          >
            <Icon aria-hidden="true" className="size-4.5" />
            {label}
          </span>
        ))}
      </nav>

      <div className="border-t border-border">
        <Button
          className="h-10 w-full justify-start rounded-none px-4 text-size-15 font-bold text-text-accent hover:bg-surface-raised"
          disabled={logout.isPending}
          onClick={() => void signOut()}
          type="button"
          variant="ghost"
        >
          <LogOut aria-hidden="true" className="size-5" />
          {logout.isPending ? "Saindo..." : "Sair"}
        </Button>
        {logout.isError ? (
          <p className="px-4 py-2 text-size-11 text-error-text" role="alert">
            Não foi possível sair. Tente novamente.
          </p>
        ) : null}
      </div>
    </aside>
  )
}
