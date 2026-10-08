import { ShoppingCart } from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import { IconButton } from "@/shared/components/ui/icon-button"

import type { NftEdition } from "../api/catalog.schemas"
import { QuantityAndPrice } from "./quantity-and-price"

interface MobileNftPurchaseBarProps {
  selectedEdition: NftEdition
  quantity: number
  isSoldOut: boolean
  isCartPending: boolean
  cartFeedback: { kind: "status" | "error"; message: string } | null
  availabilityMessage: string
  onQuantityChange: (quantity: number) => void
  onAddToCart: () => void
  onBuy: () => void
}

export function MobileNftPurchaseBar({
  selectedEdition,
  quantity,
  isSoldOut,
  isCartPending,
  cartFeedback,
  availabilityMessage,
  onQuantityChange,
  onAddToCart,
  onBuy,
}: MobileNftPurchaseBarProps) {
  return (
    <aside
      aria-label="Opções de compra"
      className="fixed inset-x-0 bottom-0 z-20 mx-auto flex min-h-44 w-full max-w-3xl flex-col gap-2 rounded-t-[40px] bg-surface-card px-6 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-overlay-mobile"
    >
      <QuantityAndPrice
        compact
        edition={selectedEdition}
        onQuantityChange={onQuantityChange}
        quantity={quantity}
      />

      <p
        className="text-size-10 leading-size-14 text-text-secondary"
        id="mobile-actions-message"
      >
        {availabilityMessage}
      </p>

      {cartFeedback ? (
        <p
          className={
            cartFeedback.kind === "error"
              ? "text-size-10 leading-size-14 text-destructive"
              : "text-size-10 leading-size-14 text-text-accent"
          }
          role={cartFeedback.kind === "error" ? "alert" : "status"}
        >
          {cartFeedback.message}
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <Button
          aria-describedby="mobile-actions-message"
          className="h-15 w-49 rounded-full bg-linear-to-r from-primary to-primary/80 text-size-16 leading-size-20 font-bold"
          disabled={isSoldOut || isCartPending}
          onClick={onBuy}
          type="button"
        >
          {isCartPending ? "Adicionando..." : isSoldOut ? "Esgotado" : "Comprar NFT"}
        </Button>
        <IconButton
          aria-describedby="mobile-actions-message"
          className="size-15 rounded-full border-border bg-surface-raised text-text-secondary"
          disabled={isSoldOut || isCartPending}
          label="Adicionar ao carrinho"
          onClick={onAddToCart}
          type="button"
          variant="outline"
        >
          <ShoppingCart aria-hidden="true" className="size-5" />
        </IconButton>
      </div>
    </aside>
  )
}
