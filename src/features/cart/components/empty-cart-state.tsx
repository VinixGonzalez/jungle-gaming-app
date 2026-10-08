import type { ComponentProps } from "react"
import { Link } from "@tanstack/react-router"
import { ArrowLeft, ShoppingCart } from "lucide-react"

import { SiteFooter, SiteHeader } from "@/shared/components/layout"
import { Button } from "@/shared/components/ui/button"
import { IconButton } from "@/shared/components/ui/icon-button"

import type { CartFeedback } from "../model/cart-feedback"
import { CartFeedbackMessage } from "./cart-feedback-message"

interface EmptyCartStateProps {
  isDesktop: boolean
  headerConfig: Omit<ComponentProps<typeof SiteHeader>, "className">
  footerConfig: Omit<ComponentProps<typeof SiteFooter>, "className">
  onBack: () => void
  feedback?: CartFeedback | null
}

export function EmptyCartState({
  isDesktop,
  headerConfig,
  footerConfig,
  onBack,
  feedback,
}: EmptyCartStateProps) {
  const content = (
    <main className="flex min-h-[65svh] flex-col items-center justify-center gap-5 px-6 text-center">
      <span
        aria-hidden="true"
        className="grid size-20 place-items-center rounded-full bg-surface-card text-text-accent"
      >
        <ShoppingCart className="size-8" />
      </span>
      <h1 className="text-size-28 leading-size-32 font-bold text-foreground">
        Seu carrinho está vazio
      </h1>
      <p className="max-w-lg text-size-15 leading-size-24 text-text-secondary">
        Explore o mercado e encontre um NFT para começar sua coleção.
      </p>
      <CartFeedbackMessage feedback={feedback ?? null} variant="empty" />
      <Button asChild className="h-11 rounded-full px-6 text-size-14 font-bold">
        <Link hash="catalogo" to="/">
          Explorar NFTs
        </Link>
      </Button>
    </main>
  )

  if (!isDesktop) {
    return (
      <div className="mx-auto min-h-svh w-full max-w-3xl overflow-hidden rounded-shell bg-ink text-foreground">
        <header className="px-6 pt-8">
          <IconButton
            className="size-11 rounded-full border-border bg-surface-raised text-text-secondary"
            label="Voltar"
            onClick={onBack}
            type="button"
            variant="outline"
          >
            <ArrowLeft aria-hidden="true" className="size-5" />
          </IconButton>
        </header>
        {content}
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-ink text-foreground">
      <div className="mx-auto flex w-full max-w-content flex-col py-page-top-desktop">
        <SiteHeader {...headerConfig} />
        {content}
        <SiteFooter {...footerConfig} />
      </div>
    </div>
  )
}
