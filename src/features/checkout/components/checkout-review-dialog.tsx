import { Button } from "@/shared/components/ui/button"
import { Dialog } from "@/shared/components/ui/dialog"
import { formatEth } from "@/shared/utils"

import { checkoutOptionLabels } from "../config/checkout-option-labels"
import type { CheckoutViewModel } from "../types/checkout-view-model"

type ReadyCheckout = Extract<CheckoutViewModel, { status: "ready" }>

interface CheckoutReviewDialogProps {
  checkout: ReadyCheckout
}

export function CheckoutReviewDialog({
  checkout,
}: CheckoutReviewDialogProps) {
  const quote = checkout.quote

  if (!quote) return null

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open && !checkout.isOrdering) checkout.closeReview()
      }}
      open={checkout.isReviewOpen}
    >
      <Dialog.Content
        aria-describedby="checkout-review-description"
        className="max-h-[calc(100svh-2rem)] max-w-2xl overflow-y-auto"
        showCloseButton={!checkout.isOrdering}
      >
        <Dialog.Header>
          <Dialog.Title>Revise sua compra</Dialog.Title>
          <Dialog.Description id="checkout-review-description">
            Confira os dados e os valores atualizados antes de criar o pedido.
          </Dialog.Description>
        </Dialog.Header>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <section aria-labelledby="review-collector-title">
            <h3
              className="text-size-12 font-bold text-foreground"
              id="review-collector-title"
            >
              Colecionador
            </h3>
            <p className="mt-2 text-size-12 text-text-secondary">
              {quote.collector.displayName}
            </p>
            <p className="mt-1 break-all text-size-11 text-text-muted">
              {quote.collector.email}
            </p>
          </section>

          <section aria-labelledby="review-wallet-title">
            <h3
              className="text-size-12 font-bold text-foreground"
              id="review-wallet-title"
            >
              Carteira
            </h3>
            <p className="mt-2 text-size-12 text-text-secondary">
              {quote.wallet.label} ·{" "}
              {checkoutOptionLabels.network[quote.network]}
            </p>
            <p className="mt-1 break-all text-size-11 text-text-muted">
              {checkoutOptionLabels.provider[quote.provider]} ·{" "}
              {quote.wallet.address}
            </p>
          </section>
        </div>

        <section aria-labelledby="review-items-title" className="mt-6">
          <h3
            className="text-size-12 font-bold text-foreground"
            id="review-items-title"
          >
            Itens
          </h3>
          <ul className="mt-3 flex flex-col gap-3">
            {quote.items.map((item) => (
              <li className="flex items-center gap-3" key={item.cartItemId}>
                <img
                  alt=""
                  className="size-12 rounded-xl object-cover"
                  src={item.imageUrl}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-size-12 font-medium">
                    {item.name}
                  </span>
                  <span className="text-size-10 text-text-secondary">
                    Token #{item.tokenId} · Qtd. {item.quantity}
                  </span>
                </span>
                <span className="text-size-11 font-bold text-text-accent">
                  {formatEth(item.lineTotalEth)}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <dl className="mt-6 flex flex-col gap-2 border-t border-border pt-4 text-size-12">
          <div className="flex justify-between gap-4">
            <dt className="text-text-secondary">Subtotal</dt>
            <dd>{formatEth(quote.totals.subtotalEth)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-text-secondary">Desconto</dt>
            <dd>
              {quote.totals.discountEth === "0"
                ? "—"
                : `− ${formatEth(quote.totals.discountEth)}`}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-text-secondary">Taxa de rede</dt>
            <dd>{formatEth(quote.totals.networkFeeEth)}</dd>
          </div>
          <div className="mt-2 flex justify-between gap-4 text-size-16 font-bold">
            <dt>Total</dt>
            <dd className="text-text-accent">
              {formatEth(quote.totals.totalEth)}
            </dd>
          </div>
        </dl>

        {checkout.feedback ? (
          <p
            className="mt-4 text-size-11 leading-size-16 text-error-text"
            role="alert"
          >
            {checkout.feedback}
          </p>
        ) : null}

        <Dialog.Footer className="mt-6 flex-col-reverse sm:flex-row">
          <Button
            className="h-11 w-full rounded-full sm:w-auto sm:min-w-32"
            disabled={checkout.isOrdering}
            onClick={checkout.closeReview}
            type="button"
            variant="outline"
          >
            Voltar
          </Button>
          <Button
            className="h-11 w-full rounded-full sm:w-auto sm:min-w-44"
            disabled={checkout.isOrdering}
            onClick={checkout.confirmOrder}
            type="button"
          >
            {checkout.isOrdering ? "Criando pedido…" : "Confirmar pedido"}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  )
}
