import type { ComponentProps } from "react"
import { Link } from "@tanstack/react-router"
import { ArrowLeft } from "lucide-react"

import { SiteHeader } from "@/shared/components/layout"
import { Button } from "@/shared/components/ui/button"
import { IconButton } from "@/shared/components/ui/icon-button"

interface NftDetailErrorStateProps {
  isDesktop: boolean
  isNotFound: boolean
  headerConfig: Omit<ComponentProps<typeof SiteHeader>, "className">
  onBack: () => void
  onRetry: () => void
}

export function NftDetailErrorState({
  isDesktop,
  isNotFound,
  headerConfig,
  onBack,
  onRetry,
}: NftDetailErrorStateProps) {
  return (
    <div className="min-h-svh bg-ink text-foreground">
      {isDesktop ? (
        <div className="mx-auto w-full max-w-content pt-page-top-desktop">
          <SiteHeader {...headerConfig} />
        </div>
      ) : (
        <div className="mx-auto flex w-full max-w-3xl px-6 pt-6">
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
        role={isNotFound ? undefined : "alert"}
      >
        <h1 className="text-size-28 leading-size-32 font-bold text-foreground">
          {isNotFound ? "NFT não encontrado" : "Não foi possível carregar o NFT"}
        </h1>
        <p className="max-w-xl text-size-15 leading-size-24 text-text-secondary">
          {isNotFound
            ? "Este NFT não existe ou não está mais disponível no mercado."
            : "O detalhe está temporariamente indisponível. Tente novamente."}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {!isNotFound ? (
            <Button onClick={onRetry} type="button">
              Tentar novamente
            </Button>
          ) : null}
          <Button asChild variant="outline">
            <Link hash="catalogo" to="/">
              Voltar ao mercado
            </Link>
          </Button>
        </div>
      </main>
    </div>
  )
}
