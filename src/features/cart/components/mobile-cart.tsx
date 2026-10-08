import { ArrowLeft, ShoppingCart } from "lucide-react"

import { IconButton } from "@/shared/components/ui/icon-button"

import type {
  ApplyCartCouponInput,
  CartResponse,
} from "../api/cart.schemas"
import type { CartFeedback } from "../model/cart-feedback"
import { CartFeedbackMessage } from "./cart-feedback-message"
import { CartSummary } from "./cart-summary"
import { MobileCartItemCard } from "./mobile-cart-item-card"

interface MobileCartProps {
  cart: CartResponse
  pendingItemId?: string
  isUpdating: boolean
  feedback: CartFeedback | null
  onBack: () => void
  onCheckout: () => void
  onQuantityChange: (itemId: string, quantity: number) => void
  onRemove: (itemId: string) => void
  onApplyCoupon: (input: ApplyCartCouponInput) => Promise<void>
  onRemoveCoupon: () => Promise<void>
}

export function MobileCart({
  cart,
  pendingItemId,
  isUpdating,
  feedback,
  onBack,
  onCheckout,
  onQuantityChange,
  onRemove,
  onApplyCoupon,
  onRemoveCoupon,
}: MobileCartProps) {
  return (
    <div className="mx-auto min-h-svh w-full max-w-3xl overflow-hidden rounded-shell bg-ink text-foreground">
      <header className="flex h-22 items-center justify-between px-6 pt-4">
        <IconButton
          className="size-11 rounded-full border-border bg-surface-raised text-text-secondary"
          label="Voltar"
          onClick={onBack}
          type="button"
          variant="outline"
        >
          <ArrowLeft aria-hidden="true" className="size-5" />
        </IconButton>
        <h1 className="text-size-18 leading-size-24 font-bold tracking-wide text-foreground">
          CARRINHO
        </h1>
        <div
          aria-label={`${cart.totals.itemCount} ${cart.totals.itemCount === 1 ? "item" : "itens"} no carrinho`}
          className="relative grid size-11 place-items-center text-text-accent"
        >
          <ShoppingCart aria-hidden="true" className="size-5" />
          {cart.totals.itemCount > 0 ? (
            <span
              aria-hidden="true"
              className="absolute top-0.5 right-0 grid size-5 place-items-center rounded-full bg-primary text-size-9 font-bold text-ink"
            >
              {cart.totals.itemCount > 99 ? "99+" : cart.totals.itemCount}
            </span>
          ) : null}
        </div>
      </header>

      <main>
        <section aria-label="Itens do carrinho" className="px-6">
          <ul className="flex flex-col gap-5">
            {cart.items.map((item) => (
              <li key={item.id}>
                <MobileCartItemCard
                  isPending={pendingItemId === item.id}
                  item={item}
                  onQuantityChange={onQuantityChange}
                  onRemove={onRemove}
                />
              </li>
            ))}
          </ul>

          <CartFeedbackMessage feedback={feedback} variant="list" />
        </section>

        <CartSummary
          cart={cart}
          className="mt-8 rounded-t-[40px] rounded-b-none px-6 pt-8 pb-[calc(2.25rem+env(safe-area-inset-bottom))]"
          isUpdating={isUpdating}
          onApplyCoupon={onApplyCoupon}
          onCheckout={onCheckout}
          onRemoveCoupon={onRemoveCoupon}
        />
      </main>
    </div>
  )
}
