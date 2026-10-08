import { useId } from "react"

import { Button } from "@/shared/components/ui/button"
import { formatEth } from "@/shared/utils"
import { cn } from "@/shared/utils"

import type { ApplyCartCouponInput, CartResponse } from "../api/cart.schemas"
import { CartCouponControl } from "./cart-coupon-control"

interface CartSummaryProps {
  cart: CartResponse
  isUpdating: boolean
  onApplyCoupon: (input: ApplyCartCouponInput) => Promise<void>
  onCheckout: () => void
  onRemoveCoupon: () => Promise<void>
  className?: string
}

export function CartSummary({
  cart,
  isUpdating,
  onApplyCoupon,
  onCheckout,
  onRemoveCoupon,
  className,
}: CartSummaryProps) {
  const titleId = useId()

  return (
    <section
      aria-busy={isUpdating}
      aria-labelledby={titleId}
      className={cn(
        "flex w-full flex-col rounded-3xl bg-surface-card p-6 transition-opacity aria-busy:opacity-75",
        className,
      )}
    >
      <h2
        className="text-size-20 leading-size-24 font-bold text-foreground"
        id={titleId}
      >
        Resumo do pedido
      </h2>

      <CartCouponControl
        coupon={cart.coupon}
        isUpdating={isUpdating}
        onApplyCoupon={onApplyCoupon}
        onRemoveCoupon={onRemoveCoupon}
      />

      <dl className="mt-5 flex flex-col gap-3 text-size-14 leading-size-20">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-text-secondary">Subtotal</dt>
          <dd className="font-medium text-foreground">
            {formatEth(cart.totals.subtotalEth)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-text-secondary">Desconto</dt>
          <dd className="font-medium text-foreground">
            {cart.totals.discountEth === "0" ? "—" : `− ${formatEth(cart.totals.discountEth)}`}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-text-secondary">Taxa de rede</dt>
          <dd className="font-medium text-foreground">
            {formatEth(cart.totals.networkFeeEth)}
          </dd>
        </div>
      </dl>

      <div className="mt-5 flex items-center justify-between gap-4 border-t border-border pt-5">
        <p className="text-size-16 font-bold text-foreground">Total</p>
        <p className="text-size-20 leading-size-24 font-bold text-text-accent">
          {formatEth(cart.totals.totalEth)}
        </p>
      </div>

      <Button
        className="mt-6 h-15 w-full rounded-full text-size-16 font-bold disabled:opacity-60"
        disabled={isUpdating}
        onClick={onCheckout}
        type="button"
      >
        Ir para pagamento
      </Button>
      {isUpdating ? (
        <p className="mt-2 text-center text-size-10 text-text-secondary" role="status">
          Atualizando os valores do carrinho.
        </p>
      ) : null}
    </section>
  )
}
