import { useState } from "react"
import { Link } from "@tanstack/react-router"
import { Heart, LogOut, UserRound, WalletCards } from "lucide-react"

import profileIcon from "@/shared/assets/icons/navigation/profile.svg"
import { Button } from "@/shared/components/ui/button"
import { Dialog } from "@/shared/components/ui/dialog"
import { IconButton } from "@/shared/components/ui/icon-button"

import type { AuthUser } from "../api/auth.schemas"
import { useLogoutMutation } from "../hooks/use-logout-mutation"

interface AuthenticatedAccountActionProps {
  user: AuthUser
  variant: "desktop" | "mobile"
}

const mobileActionClassName =
  "grid size-11 place-items-center rounded-full bg-transparent outline-none transition-opacity hover:bg-transparent hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring"

export function AuthenticatedAccountAction({
  user,
  variant,
}: AuthenticatedAccountActionProps) {
  const logout = useLogoutMutation()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  function changeDialogOpen(isOpen: boolean) {
    setIsDialogOpen(isOpen)

    if (!isOpen) logout.reset()
  }

  async function signOut() {
    try {
      await logout.mutateAsync()
      setIsDialogOpen(false)
    } catch {
      // The mutation state keeps the dialog open with an accessible error.
    }
  }

  const trigger =
    variant === "mobile" ? (
      <IconButton
        className={mobileActionClassName}
        label={`Abrir conta de ${user.username}`}
        variant="ghost"
      >
        <img alt="" className="max-h-5 max-w-5" src={profileIcon} />
      </IconButton>
    ) : (
      <Button
        className="h-8.75 max-w-44 gap-2 px-3 text-size-13"
        title={user.username}
        variant="outline"
      >
        <img alt="" className="size-4.5" src={profileIcon} />
        <span className="truncate">@{user.username}</span>
      </Button>
    )

  return (
    <Dialog onOpenChange={changeDialogOpen} open={isDialogOpen}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Content
        aria-busy={logout.isPending}
        className="w-[calc(100%-2rem)] max-w-sm gap-0 rounded-2xl p-6"
      >
        <Dialog.Header>
          <Dialog.Title>Sua conta</Dialog.Title>
          <Dialog.Description>
            Sessão ativa para @{user.username}.
          </Dialog.Description>
        </Dialog.Header>

        <div className="mt-5 rounded-xl border border-border p-4">
          <p className="truncate text-size-14 font-bold text-foreground">
            @{user.username}
          </p>
          <p className="mt-1 truncate text-size-12 text-text-secondary">
            {user.email}
          </p>
        </div>

        <nav className="mt-4 grid gap-3 sm:grid-cols-3" aria-label="Sua conta">
          <Button asChild variant="outline">
            <Link onClick={() => changeDialogOpen(false)} to="/profile">
              <UserRound aria-hidden="true" className="size-4" />
              Perfil
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link onClick={() => changeDialogOpen(false)} to="/wallets">
              <WalletCards aria-hidden="true" className="size-4" />
              Carteiras
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link onClick={() => changeDialogOpen(false)} to="/favorites">
              <Heart aria-hidden="true" className="size-4" />
              Favoritos
            </Link>
          </Button>
        </nav>

        {logout.isError ? (
          <p
            className="mt-4 text-size-12 leading-size-16 text-error-text"
            role="alert"
          >
            Não foi possível sair. Tente novamente.
          </p>
        ) : null}

        <div className="mt-6 flex justify-end gap-3">
          <Dialog.Close asChild>
            <Button disabled={logout.isPending} type="button" variant="ghost">
              Cancelar
            </Button>
          </Dialog.Close>
          <Button
            disabled={logout.isPending}
            onClick={() => void signOut()}
            type="button"
            variant="outline"
          >
            <LogOut aria-hidden="true" className="size-4" />
            {logout.isPending ? "Saindo..." : "Sair"}
          </Button>
        </div>
      </Dialog.Content>
    </Dialog>
  )
}
