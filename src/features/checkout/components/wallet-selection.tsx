import type { Ref } from "react"

import type {
  Wallet,
  WalletConnection,
  WalletNetwork,
} from "@/features/wallets"

import { checkoutOptionLabels } from "../config/checkout-option-labels"

interface WalletSelectionProps {
  connection: WalletConnection | null
  firstOptionRef?: Ref<HTMLInputElement>
  selectedNetwork: WalletNetwork
  selectedWalletId: string
  wallets: Wallet[]
  onSelect: (walletId: string) => void
}

function getShortAddress(address: string) {
  if (address.length <= 18) return address
  return `${address.slice(0, 8)}…${address.slice(-6)}`
}

export function WalletSelection({
  connection,
  firstOptionRef,
  selectedNetwork,
  selectedWalletId,
  wallets,
  onSelect,
}: WalletSelectionProps) {
  return (
    <fieldset>
      <legend className="sr-only">Selecione uma carteira registrada</legend>
      {wallets.length > 0 ? (
        <div className="flex flex-col gap-3">
          {wallets.map((wallet, index) => {
            const isSelected = selectedWalletId === wallet.id
            const displayedNetwork = isSelected
              ? selectedNetwork
              : wallet.network
            const isConnected =
              connection?.walletId === wallet.id &&
              (!isSelected || connection.network === selectedNetwork)

            return (
              <label
                className="flex min-h-23 cursor-pointer items-center gap-4 rounded-3xl border border-border bg-surface-card px-5 py-4 transition-colors hover:border-primary has-checked:border-primary has-checked:bg-surface-raised"
                key={wallet.id}
              >
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 text-size-14 font-bold text-foreground">
                    {wallet.label}
                    {isConnected ? (
                      <span className="rounded-full bg-success/15 px-2 py-0.5 text-size-9 font-medium text-success">
                        Conectada
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-1 block truncate text-size-12 text-text-secondary">
                    {getShortAddress(wallet.address)}
                  </span>
                  <span className="mt-1 block text-size-10 text-text-muted">
                    {checkoutOptionLabels.network[displayedNetwork]}
                  </span>
                </span>
                <input
                  checked={isSelected}
                  className="size-4 accent-primary"
                  ref={index === 0 ? firstOptionRef : undefined}
                  name="checkout-wallet"
                  onChange={() => onSelect(wallet.id)}
                  type="radio"
                  value={wallet.id}
                />
              </label>
            )
          })}
        </div>
      ) : (
        <p className="rounded-3xl border border-border bg-surface-card p-5 text-size-13 text-text-secondary">
          Nenhuma carteira registrada foi encontrada.
        </p>
      )}
    </fieldset>
  )
}
