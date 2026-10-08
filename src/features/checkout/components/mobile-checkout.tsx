import { useEffect, useRef } from "react"
import { ArrowLeft } from "lucide-react"

import type { WalletNetwork } from "@/features/wallets"
import { Button } from "@/shared/components/ui/button"
import { FormField } from "@/shared/components/ui/form-field"
import { IconButton } from "@/shared/components/ui/icon-button"
import { Select } from "@/shared/components/ui/select"

import { checkoutOptionLabels } from "../config/checkout-option-labels"
import type { CheckoutViewModel } from "../types/checkout-view-model"
import { CheckoutSummary } from "./checkout-summary"
import { CollectorDataFields } from "./collector-data-fields"
import { WalletProviderOptions } from "./wallet-provider-options"
import { WalletSelection } from "./wallet-selection"

type ReadyCheckout = Extract<CheckoutViewModel, { status: "ready" }>

interface MobileCheckoutProps {
  checkout: ReadyCheckout
  onBack: () => void
}

export function MobileCheckout({ checkout, onBack }: MobileCheckoutProps) {
  const collectorDetailsRef = useRef<HTMLDetailsElement>(null)
  const firstWalletRef = useRef<HTMLInputElement>(null)
  const selectedWallet = checkout.wallets.find(
    (wallet) => wallet.id === checkout.selectedWalletId,
  )
  const hasCollectorErrors = Object.keys(checkout.errors).length > 0

  useEffect(() => {
    if (!hasCollectorErrors) return

    const details = collectorDetailsRef.current

    if (!details) return

    details.open = true
    details.querySelector<HTMLElement>("[aria-invalid='true']")?.focus()
  }, [hasCollectorErrors])

  return (
    <main className="mx-auto min-h-svh w-full max-w-3xl overflow-hidden rounded-shell bg-ink px-7 pt-7 pb-[calc(2rem+env(safe-area-inset-bottom))] text-foreground">
      <header>
        <IconButton
          className="size-9 rounded-full border-border bg-surface-raised text-text-secondary"
          label="Voltar"
          onClick={onBack}
          type="button"
          variant="outline"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
        </IconButton>
        <h1 className="mt-7 text-size-20 leading-size-28 font-bold">
          Pagamento com carteira
        </h1>
      </header>

      <form
        className="mt-8"
        id="checkout-payment-form"
        noValidate
        onSubmit={checkout.submitForReview}
      >
        <section aria-labelledby="connected-wallet-title">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2
                className="text-size-14 font-bold"
                id="connected-wallet-title"
              >
                {checkout.connection
                  ? "Carteira conectada"
                  : "Escolha sua carteira"}
              </h2>
              {checkout.connection && selectedWallet ? (
                <p className="mt-1 text-size-10 text-text-secondary">
                  {selectedWallet.label}
                </p>
              ) : null}
            </div>
            <Button
              className="h-auto p-0 text-size-11 font-normal"
              onClick={() => firstWalletRef.current?.focus()}
              type="button"
              variant="link"
            >
              Trocar carteira
            </Button>
          </div>

          <div className="mt-4">
            <WalletSelection
              connection={checkout.connection}
              firstOptionRef={firstWalletRef}
              onSelect={checkout.selectWallet}
              selectedNetwork={checkout.selectedNetwork}
              selectedWalletId={checkout.selectedWalletId}
              wallets={checkout.wallets}
            />
          </div>

          <FormField
            className="mt-5"
            htmlFor="checkout-mobile-network"
            label="Rede"
            required
          >
            <Select
              disabled={!selectedWallet}
              id="checkout-mobile-network"
              onChange={(event) =>
                checkout.selectNetwork(event.target.value as WalletNetwork)
              }
              required
              value={checkout.selectedNetwork}
            >
              {selectedWallet?.supportedNetworks.map((network) => (
                <option key={network} value={network}>
                  {checkoutOptionLabels.network[network]}
                </option>
              ))}
            </Select>
          </FormField>
        </section>

        <div className="mt-8">
          <WalletProviderOptions
            hasConnection={Boolean(checkout.connection)}
            isConnected={checkout.isSelectionConnected}
            isConnecting={checkout.isConnecting}
            isDisconnecting={checkout.isDisconnecting}
            onConnect={checkout.connectWallet}
            onDisconnect={checkout.disconnectWallet}
            onSelect={checkout.selectProvider}
            selectedProvider={checkout.selectedProvider}
          />
        </div>

        <details
          className="group mt-8 rounded-3xl border border-border bg-surface-card p-5"
          ref={collectorDetailsRef}
        >
          <summary className="cursor-pointer list-none text-size-14 font-bold text-foreground outline-none focus-visible:text-primary">
            Dados do colecionador
            <span className="float-right text-size-11 font-normal text-text-accent group-open:hidden">
              Editar
            </span>
            <span className="float-right hidden text-size-11 font-normal text-text-accent group-open:inline">
              Recolher
            </span>
          </summary>
          <CollectorDataFields
            className="mt-5"
            errors={checkout.errors}
            register={checkout.register}
          />
        </details>

        <CheckoutSummary checkout={checkout} compact />
      </form>
    </main>
  )
}
