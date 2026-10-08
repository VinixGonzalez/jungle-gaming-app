import { Link } from "@tanstack/react-router"

import closeIcon from "@/shared/assets/icons/auth/close.svg"
import { BrandWordmark } from "@/shared/components/ui/brand-wordmark"
import { Button } from "@/shared/components/ui/button"
import { Dialog } from "@/shared/components/ui/dialog"

import { AuthSocialActions } from "./auth-social-actions"
import { LoginForm } from "./login-form"
import { RegisterForm } from "./register-form"

interface AuthPanelProps {
  mode: "login" | "register"
  onClose: () => void
  onSuccess: () => void
  returnTo: string
}

export function AuthPanel({
  mode,
  onClose,
  onSuccess,
  returnTo,
}: AuthPanelProps) {
  const isLogin = mode === "login"
  const title = isLogin ? "Entrar" : "Criar conta"
  const mobileTitle = isLogin ? title : "Criar perfil de colecionador"
  const description = isLogin
    ? "Entre para gerenciar sua carteira, coleção e perfil de criador."
    : "Crie seu perfil de colecionador e conecte uma carteira quando quiser."

  return (
    <div className="relative flex min-h-svh w-full flex-col items-start gap-10 px-7 pt-20 pb-6 md:mx-auto md:max-w-103.5 xl:h-full xl:min-h-0 xl:max-w-none xl:gap-0 xl:px-0 xl:pt-0 xl:pb-0">
      <Dialog.Title className="sr-only">{title}</Dialog.Title>
      <Dialog.Description className="sr-only">
        {description}
      </Dialog.Description>

      <div className="flex h-34 w-full shrink-0 items-center justify-center xl:hidden">
        <BrandWordmark
          className="rounded-sm text-size-32 tracking-brand hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
          href={returnTo}
          name="KURIO"
          onClick={(event) => {
            event.preventDefault()
            onClose()
          }}
        />
      </div>

      <header className="hidden w-full flex-col items-center pt-12 xl:flex">
        <div className="flex w-full flex-col items-center gap-10 px-12">
          <nav
            aria-label="Acesso à conta"
            className="flex items-stretch justify-center gap-2 text-size-20 leading-size-16 font-medium"
          >
            {isLogin ? (
              <span aria-current="page" className="text-text-accent">
                Entrar
              </span>
            ) : (
              <Link
                className="text-foreground outline-none transition-colors hover:text-text-accent focus-visible:text-text-accent"
                replace
                search={{ returnTo }}
                state
                to="/login"
              >
                Entrar
              </Link>
            )}
            <span aria-hidden="true" className="w-px bg-text-coral" />
            {isLogin ? (
              <Link
                className="text-foreground outline-none transition-colors hover:text-text-accent focus-visible:text-text-accent"
                replace
                search={{ returnTo }}
                state
                to="/register"
              >
                Criar conta
              </Link>
            ) : (
              <span aria-current="page" className="text-text-accent">
                Criar conta
              </span>
            )}
          </nav>

          <p className="w-full text-center text-size-13 leading-size-16 text-foreground">
            {description}
          </p>
        </div>
      </header>

      <h1
        className={
          isLogin
            ? "w-full text-center text-size-20 leading-size-16 font-bold xl:hidden"
            : "w-full text-center text-size-18 leading-size-16 font-bold xl:hidden"
        }
      >
        {mobileTitle}
      </h1>

      {isLogin ? (
        <LoginForm onSuccess={onSuccess} />
      ) : (
        <RegisterForm onSuccess={onSuccess} />
      )}

      <AuthSocialActions compact={isLogin} />

      <Link
        className="w-full text-center text-size-15 leading-size-16 text-text-secondary outline-none transition-colors hover:text-primary focus-visible:text-primary xl:hidden"
        replace
        search={{ returnTo }}
        state
        to={isLogin ? "/register" : "/login"}
      >
        {isLogin ? "Novo na Kurio? Crie uma conta" : "Já tem uma conta? Entre"}
      </Link>

      <span
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 hidden h-2.5 bg-primary xl:block"
      />

      <Button
        aria-label="Fechar"
        className="absolute top-0 right-1 hidden size-10 bg-transparent p-0 hover:bg-transparent focus-visible:ring-2 xl:grid"
        onClick={onClose}
        size="icon"
        type="button"
        variant="ghost"
      >
        <img alt="" className="size-4.5" src={closeIcon} />
      </Button>
    </div>
  )
}
