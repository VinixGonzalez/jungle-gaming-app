import { Link } from "@tanstack/react-router"

import type { WalletNetwork, WalletProvider } from "@/features/wallets"
import { FormField } from "@/shared/components/ui/form-field"
import { Input } from "@/shared/components/ui/input"
import { Select } from "@/shared/components/ui/select"

import { checkoutOptionLabels } from "../config/checkout-option-labels"
import type { CheckoutViewModel } from "../types/checkout-view-model"
import { CheckoutSummary } from "./checkout-summary"
import { CollectorDataFields } from "./collector-data-fields"
import { WalletProviderOptions } from "./wallet-provider-options"

type ReadyCheckout = Extract<CheckoutViewModel, { status: "ready" }>

interface DesktopCheckoutProps {
  checkout: ReadyCheckout
}

export function DesktopCheckout({ checkout }: DesktopCheckoutProps) {
  const selectedWallet = checkout.wallets.find(
    (wallet) => wallet.id === checkout.selectedWalletId,
  )

  return (
    <main className="mx-auto w-full max-w-content py-8">
      <nav aria-label="Breadcrumb" className="text-size-12 leading-size-16">
        <ol className="flex items-center gap-2 text-text-secondary">
          <li>
            <Link
              className="outline-none hover:text-primary focus-visible:text-primary"
              to="/"
            >
              Início
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              className="outline-none hover:text-primary focus-visible:text-primary"
              hash="catalogo"
              to="/"
            >
              Mercado
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-foreground">
            Pagamento
          </li>
        </ol>
      </nav>

      <form
        className="mt-7 grid grid-cols-[minmax(0,1fr)_405px] items-start gap-8"
        id="checkout-payment-form"
        noValidate
        onSubmit={checkout.submitForReview}
      >
        <section aria-labelledby="collector-profile-title" className="min-w-0">
          <h1
            className="text-size-28 leading-size-32 font-bold text-foreground"
            id="collector-profile-title"
          >
            Perfil do colecionador
          </h1>

          <CollectorDataFields
            className="mt-6"
            errors={checkout.errors}
            register={checkout.register}
          />

          <section
            aria-labelledby="registered-wallet-title"
            className="mt-8 border-t border-border pt-7"
          >
            <h2
              className="text-size-18 leading-size-24 font-bold"
              id="registered-wallet-title"
            >
              Carteira registrada
            </h2>
            <div className="mt-4 grid gap-x-7 gap-y-4 md:grid-cols-2">
              <FormField
                htmlFor="checkout-wallet-select"
                label="Carteira"
                required
              >
                <Select
                  id="checkout-wallet-select"
                  onChange={(event) => checkout.selectWallet(event.target.value)}
                  required
                  value={checkout.selectedWalletId}
                >
                  {checkout.wallets.length === 0 ? (
                    <option value="">Nenhuma carteira registrada</option>
                  ) : null}
                  {checkout.wallets.map((wallet) => (
                    <option key={wallet.id} value={wallet.id}>
                      {wallet.label}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField htmlFor="checkout-network" label="Rede" required>
                <Select
                  disabled={!selectedWallet}
                  id="checkout-network"
                  onChange={(event) =>
                    checkout.selectNetwork(
                      event.target.value as WalletNetwork,
                    )
                  }
                  required
                  value={checkout.selectedNetwork}
                >
                  {selectedWallet ? null : (
                    <option value="">Selecione uma carteira</option>
                  )}
                  {selectedWallet?.supportedNetworks.map((network) => (
                    <option key={network} value={network}>
                      {checkoutOptionLabels.network[network]}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField
                htmlFor="checkout-wallet-address"
                label="Endereço da carteira"
                required
              >
                <Input
                  id="checkout-wallet-address"
                  readOnly
                  required
                  value={selectedWallet?.address ?? ""}
                />
              </FormField>

              <FormField
                htmlFor="checkout-provider-select"
                label="Tipo de carteira"
                required
              >
                <Select
                  id="checkout-provider-select"
                  onChange={(event) =>
                    checkout.selectProvider(event.target.value as WalletProvider)
                  }
                  required
                  value={checkout.selectedProvider}
                >
                  <option value="wallet-connect">WalletConnect</option>
                  <option value="metamask">MetaMask</option>
                  <option value="coinbase">Coinbase Wallet</option>
                </Select>
              </FormField>
            </div>
          </section>
        </section>

        <aside className="flex min-w-0 flex-col gap-7">
          <CheckoutSummary checkout={checkout} />
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
        </aside>
      </form>
    </main>
  )
}
