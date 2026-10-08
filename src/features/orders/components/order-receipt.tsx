import { BadgeCheck, ExternalLink } from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import { Dialog } from "@/shared/components/ui/dialog"
import { formatEth } from "@/shared/utils"

import type { Order } from "../api/order.schemas"

interface OrderReceiptProps {
  onClose: () => void
  order: Extract<Order, { status: "confirmed" }>
}

const providerLabels = {
  "wallet-connect": "WalletConnect",
  metamask: "MetaMask",
  coinbase: "Coinbase Wallet",
} as const

const networkLabels = {
  ethereum: "Ethereum",
  polygon: "Polygon",
  solana: "Solana",
} as const

function formatOrderDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value))
}

function shortenReference(value: string) {
  return value.length > 14 ? `${value.slice(0, 8)}…${value.slice(-4)}` : value
}

export function OrderReceipt({ onClose, order }: OrderReceiptProps) {
  const { receipt, transaction } = order

  return (
    <Dialog
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose()
      }}
      open
    >
      <Dialog.Content
        className="max-h-[calc(100svh-2rem)] w-[calc(100%-2rem)] max-w-144.5 overflow-y-auto rounded-2xl border-border-soft bg-surface-card p-0 shadow-overlay xl:rounded-none"
      >
        <header className="flex min-h-39 flex-col items-center justify-center gap-3 px-12 pt-8 pb-5 text-center">
          <BadgeCheck aria-hidden="true" className="size-16 text-primary" />
          <Dialog.Title className="text-size-16 leading-size-20 font-bold text-text-secondary">
            Seus NFTs agora estão na sua carteira
          </Dialog.Title>
          <Dialog.Description className="sr-only">
            Recibo do pedido confirmado {order.id}.
          </Dialog.Description>
        </header>

        <dl className="grid grid-cols-2 border-y border-primary px-6 py-3 text-size-12 text-text-secondary sm:grid-cols-4 sm:px-9">
          <div className="min-w-0 border-r border-border-soft pr-3">
            <dt className="font-bold">ID da transação</dt>
            <dd className="mt-1 truncate" title={transaction.reference}>
              {shortenReference(transaction.reference)}
            </dd>
          </div>
          <div className="min-w-0 pl-3 sm:border-r sm:border-border-soft sm:pr-3">
            <dt>Data</dt>
            <dd className="mt-1">{formatOrderDate(transaction.confirmedAt)}</dd>
          </div>
          <div className="mt-3 min-w-0 border-r border-border-soft pr-3 sm:mt-0 sm:pl-3">
            <dt>Total</dt>
            <dd className="mt-1 truncate">{formatEth(receipt.totals.totalEth)}</dd>
          </div>
          <div className="mt-3 min-w-0 pl-3 sm:mt-0">
            <dt className="font-bold">Carteira</dt>
            <dd className="mt-1 truncate">{providerLabels[receipt.provider]}</dd>
          </div>
        </dl>

        <section className="px-5 pt-5 pb-10 sm:px-11" aria-labelledby="receipt-details-title">
          <h2
            className="text-size-15 leading-size-16 font-bold text-foreground"
            id="receipt-details-title"
          >
            Detalhes da transação
          </h2>

          <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto_auto] gap-3 border-b border-border-soft pb-2 text-size-12 font-bold text-foreground sm:text-size-14">
            <span>NFTs</span>
            <span>Edições</span>
            <span className="text-right">Subtotal</span>
          </div>

          <ul aria-label="Itens do pedido" className="mt-3 flex flex-col gap-3">
            {receipt.items.map((item) => (
              <li
                className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3"
                key={item.cartItemId}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <img
                    alt=""
                    className="size-15 shrink-0 rounded-lg object-cover sm:size-17.5"
                    src={item.imageUrl}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-size-13 font-bold text-foreground sm:text-size-15">
                      {item.name}
                    </p>
                    <p className="mt-1 truncate text-size-10 text-secondary sm:text-size-12">
                      ID do token: #{item.tokenId.padStart(4, "0")}
                    </p>
                  </div>
                </div>
                <p className="text-size-12 text-text-secondary">(x {item.quantity})</p>
                <p className="text-right text-size-13 font-bold text-text-accent sm:text-size-16">
                  {formatEth(item.lineTotalEth)}
                </p>
              </li>
            ))}
          </ul>

          <dl className="mt-5 ml-auto flex max-w-80 flex-col gap-3 border-b border-border-soft pb-3 text-size-14">
            <div className="flex justify-between gap-6 text-foreground">
              <dt>Subtotal</dt>
              <dd>{formatEth(receipt.totals.subtotalEth)}</dd>
            </div>
            {receipt.coupon ? (
              <div className="flex justify-between gap-6 text-foreground">
                <dt>Desconto ({receipt.coupon.code})</dt>
                <dd>− {formatEth(receipt.totals.discountEth)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between gap-6 text-foreground">
              <dt>Taxa de rede</dt>
              <dd>{formatEth(receipt.totals.networkFeeEth)}</dd>
            </div>
            <div className="flex justify-between gap-6 font-bold">
              <dt className="text-foreground">Total</dt>
              <dd className="text-text-accent">{formatEth(receipt.totals.totalEth)}</dd>
            </div>
          </dl>

          <p className="mx-auto mt-5 max-w-md text-center text-size-11 leading-size-18 text-text-secondary">
            Transação confirmada na rede {networkLabels[receipt.network]}. A
            propriedade foi transferida para sua carteira conectada e
            registrada na rede.
          </p>

          <div className="mt-6 flex justify-center">
            <Button asChild className="h-11 px-4 font-bold">
              <a href={transaction.explorerUrl} rel="noreferrer" target="_blank">
                Ver no explorador
                <ExternalLink aria-hidden="true" className="size-4" />
              </a>
            </Button>
          </div>
        </section>

        <div aria-hidden="true" className="h-2.5 bg-primary" />
      </Dialog.Content>
    </Dialog>
  )
}
