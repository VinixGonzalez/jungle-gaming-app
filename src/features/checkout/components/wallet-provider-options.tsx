import { WalletCards } from "lucide-react"

import type { WalletProvider } from "@/features/wallets"
import { Button } from "@/shared/components/ui/button"

interface WalletProviderOptionsProps {
  hasConnection: boolean
  isConnected: boolean
  isConnecting: boolean
  isDisconnecting: boolean
  selectedProvider: WalletProvider
  onConnect: () => void
  onDisconnect: () => void
  onSelect: (provider: WalletProvider) => void
}

const providerOptions = [
  { id: "wallet-connect", label: "WalletConnect", mark: "W" },
  { id: "metamask", label: "MetaMask", mark: "M" },
  { id: "coinbase", label: "Coinbase Wallet", mark: null },
] satisfies Array<{
  id: WalletProvider
  label: string
  mark: string | null
}>

export function WalletProviderOptions({
  hasConnection,
  isConnected,
  isConnecting,
  isDisconnecting,
  selectedProvider,
  onConnect,
  onDisconnect,
  onSelect,
}: WalletProviderOptionsProps) {
  const isBusy = isConnecting || isDisconnecting

  return (
    <section aria-labelledby="wallet-provider-title">
      <h2
        className="text-size-18 leading-size-24 font-bold text-foreground"
        id="wallet-provider-title"
      >
        Carteira e rede
      </h2>

      <fieldset className="mt-4">
        <legend className="sr-only">Provedor da carteira</legend>
        <div className="flex flex-col gap-3">
          {providerOptions.map((provider) => (
            <label
              className="flex min-h-16 cursor-pointer items-center gap-4 rounded-3xl border border-border bg-surface-card px-5 transition-colors hover:border-primary has-checked:border-primary has-checked:bg-surface-raised"
              key={provider.id}
            >
              <span
                aria-hidden="true"
                className="grid size-8 place-items-center rounded-full bg-foreground text-size-14 font-black text-ink"
              >
                {provider.mark ?? <WalletCards className="size-4" />}
              </span>
              <span className="flex-1 text-size-13 font-medium text-foreground">
                {provider.label}
              </span>
              <input
                checked={selectedProvider === provider.id}
                className="size-4 accent-primary"
                name="wallet-provider"
                onChange={() => onSelect(provider.id)}
                type="radio"
                value={provider.id}
              />
            </label>
          ))}
        </div>
      </fieldset>

      <Button
        className="mt-3 h-10 w-full rounded-full"
        disabled={isBusy}
        onClick={isConnected ? onDisconnect : onConnect}
        type="button"
        variant="outline"
      >
        {isDisconnecting
          ? "Desconectando…"
          : isConnecting
            ? "Conectando…"
            : isConnected
              ? "Desconectar carteira"
              : hasConnection
                ? "Conectar seleção"
                : "Conectar carteira"}
      </Button>
    </section>
  )
}
