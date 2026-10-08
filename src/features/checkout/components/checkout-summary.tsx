import { Button } from "@/shared/components/ui/button"
import { formatEth } from "@/shared/utils"
import { cn } from "@/shared/utils"

import type { CheckoutViewModel } from "../types/checkout-view-model"

type ReadyCheckout = Extract<CheckoutViewModel, { status: "ready" }>

interface CheckoutSummaryProps {
  checkout: ReadyCheckout
  compact?: boolean
  className?: string
}

export function CheckoutSummary({
  checkout,
  compact = false,
  className,
}: CheckoutSummaryProps) {
  const totals = checkout.quote?.totals ?? checkout.cart.totals
  const items = checkout.quote?.items ??
    checkout.cart.items.map((item) => ({
      id: item.id,
      imageUrl: item.product.imageUrl,
      lineTotalEth: item.lineTotalEth,
      name: item.product.name,
      quantity: item.quantity,
      secondaryLabel: `Edição de ${item.edition.totalSupply}`,
    }))
  const normalizedItems = items.map((item) => ({
    id: "id" in item ? item.id : item.cartItemId,
    imageUrl: item.imageUrl,
    lineTotalEth: item.lineTotalEth,
    name: item.name,
    quantity: item.quantity,
    secondaryLabel:
      "secondaryLabel" in item
        ? item.secondaryLabel
        : `Token #${item.tokenId}`,
  }))
  const isBusy = checkout.isQuoting || checkout.isOrdering

  return (
    <section
      aria-busy={isBusy}
      aria-labelledby="checkout-summary-title"
      className={cn(
        "flex flex-col rounded-3xl bg-surface-card",
        compact ? "bg-transparent" : "p-6",
        className,
      )}
    >
      {!compact ? (
        <>
          <h2
            className="text-size-20 leading-size-24 font-bold text-foreground"
            id="checkout-summary-title"
          >
            Seus NFTs
          </h2>
          <ul className="mt-5 flex max-h-72 flex-col gap-4 overflow-y-auto pr-1">
            {normalizedItems.map((item) => (
              <li className="flex items-center gap-3" key={item.id}>
                <img
                  alt=""
                  className="size-14 shrink-0 rounded-xl object-cover"
                  src={item.imageUrl}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-size-12 font-bold text-foreground">
                    {item.name}
                  </span>
                  <span className="mt-1 block text-size-10 text-text-secondary">
                    {item.secondaryLabel} · Qtd. {item.quantity}
                  </span>
                </span>
                <span className="shrink-0 text-size-11 font-bold text-text-accent">
                  {formatEth(item.lineTotalEth)}
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <h2 className="sr-only" id="checkout-summary-title">
          Resumo do pedido
        </h2>
      )}

      {!compact ? (
        <dl className="mt-6 flex flex-col gap-3 border-t border-border pt-5 text-size-12">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-text-secondary">Subtotal</dt>
            <dd className="font-medium text-foreground">
              {formatEth(totals.subtotalEth)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-text-secondary">Desconto</dt>
            <dd className="font-medium text-foreground">
              {totals.discountEth === "0"
                ? "—"
                : `− ${formatEth(totals.discountEth)}`}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-text-secondary">Taxa de rede</dt>
            <dd className="font-medium text-foreground">
              {formatEth(totals.networkFeeEth)}
            </dd>
          </div>
          <p className="text-size-9 leading-size-14 text-text-muted">
            A taxa é estimada e será validada antes da confirmação.
          </p>
        </dl>
      ) : null}

      <div
        className={cn(
          "flex items-center justify-between gap-4",
          compact ? "mt-7" : "mt-5 border-t border-border pt-5",
        )}
      >
        <p className="text-size-16 font-bold text-foreground">Total</p>
        <p className="text-size-20 leading-size-24 font-bold text-text-accent">
          {formatEth(totals.totalEth)}
        </p>
      </div>

      <Button
        className="mt-6 h-15 w-full rounded-full text-size-16 font-bold disabled:opacity-60"
        disabled={
          isBusy ||
          !checkout.isSelectionConnected ||
          checkout.wallets.length === 0
        }
        form="checkout-payment-form"
        type="submit"
      >
        {checkout.isQuoting ? "Validando valores…" : "Revisar compra"}
      </Button>

      {!checkout.isSelectionConnected ? (
        <p className="mt-2 text-center text-size-10 text-text-secondary">
          Conecte a carteira selecionada para continuar.
        </p>
      ) : null}
      {checkout.feedback ? (
        <p
          className="mt-3 text-center text-size-11 leading-size-16 text-text-secondary"
          role="status"
        >
          {checkout.feedback}
        </p>
      ) : null}
    </section>
  )
}
