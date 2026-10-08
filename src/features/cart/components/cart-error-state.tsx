import type { ComponentProps } from "react"
import { Link } from "@tanstack/react-router"
import { ArrowLeft } from "lucide-react"

import { SiteHeader } from "@/shared/components/layout"
import { Button } from "@/shared/components/ui/button"
import { IconButton } from "@/shared/components/ui/icon-button"

interface CartErrorStateProps {
  isDesktop: boolean
  headerConfig: Omit<ComponentProps<typeof SiteHeader>, "className">
  onBack: () => void
  onRetry: () => void
}

export function CartErrorState({
  isDesktop,
  headerConfig,
  onBack,
  onRetry,
}: CartErrorStateProps) {
  return (
    <div className="min-h-svh bg-ink text-foreground">
      {isDesktop ? (
        <div className="mx-auto w-full max-w-content pt-page-top-desktop">
          <SiteHeader {...headerConfig} />
        </div>
      ) : (
        <div className="mx-auto flex w-full max-w-3xl px-6 pt-8">
          <IconButton
            className="size-11 rounded-full border-border bg-surface-raised text-text-secondary"
            label="Voltar"
            onClick={onBack}
            type="button"
            variant="outline"
          >
            <ArrowLeft aria-hidden="true" className="size-5" />
          </IconButton>
        </div>
      )}

      <main
        className="mx-auto flex min-h-[70svh] w-full max-w-content flex-col items-center justify-center gap-5 px-6 text-center"
        role="alert"
      >
        <h1 className="text-size-28 leading-size-32 font-bold text-foreground">
          Não foi possível carregar o carrinho
        </h1>
        <p className="max-w-xl text-size-15 leading-size-24 text-text-secondary">
          O carrinho está temporariamente indisponível. Tente novamente.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={onRetry} type="button">
            Tentar novamente
          </Button>
          <Button asChild variant="outline">
            <Link hash="catalogo" to="/">
              Continuar explorando
            </Link>
          </Button>
        </div>
      </main>
    </div>
  )
}
