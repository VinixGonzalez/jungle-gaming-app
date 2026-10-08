import type {
  Wallet,
  WalletConnection,
  WalletRole,
} from "@/features/wallets"
import { Button } from "@/shared/components/ui/button"

import type { CollectorProfile } from "../api/account.schemas"
import { WalletForm } from "./wallet-form"

interface WalletSectionProps {
  connection: WalletConnection | null
  expanded: boolean
  onExpandedChange?: (expanded: boolean) => void
  profile: CollectorProfile
  relatedWallet?: Wallet
  role: WalletRole
  wallet?: Wallet
}

export function WalletSection({
  connection,
  expanded,
  onExpandedChange,
  profile,
  relatedWallet,
  role,
  wallet,
}: WalletSectionProps) {
  const isPrimary = role === "primary"
  const title = isPrimary ? "Carteira principal" : "Carteira secundária"
  const description = isPrimary
    ? "Esta carteira fica disponível no pagamento e para receber NFTs comprados."
    : "Use uma segunda carteira sem substituir a principal."
  const canManage = isPrimary || Boolean(wallet || relatedWallet)

  return (
    <section aria-labelledby={`${role}-wallet-title`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2
            className="text-size-17 font-bold leading-size-20"
            id={`${role}-wallet-title`}
          >
            {title}
          </h2>
          <p className="mt-1 text-size-12 leading-size-16 text-text-secondary md:text-size-13">
            {description}
          </p>
        </div>
        {!isPrimary ? (
          <Button
            aria-controls={`${role}-wallet-content`}
            aria-expanded={expanded}
            className="h-8 px-1 text-size-14 font-medium text-text-accent"
            disabled={!canManage}
            onClick={() => onExpandedChange?.(!expanded)}
            type="button"
            variant="ghost"
          >
            {expanded ? "Cancelar" : wallet ? "Editar" : "Adicionar"}
          </Button>
        ) : null}
      </div>

      {expanded ? (
        <div className="mt-6" id={`${role}-wallet-content`}>
          <WalletForm
            connection={connection}
            onSaved={isPrimary ? undefined : () => onExpandedChange?.(false)}
            profile={profile}
            relatedWallet={relatedWallet}
            role={role}
            wallet={wallet}
          />
        </div>
      ) : wallet ? (
        <div
          className="mt-3 rounded-md border border-border bg-surface-card/35 p-4"
          id={`${role}-wallet-content`}
        >
          <p className="text-size-13 font-bold text-foreground">
            {wallet.label}
          </p>
          <p className="mt-1 truncate text-size-12 text-text-secondary">
            {wallet.address}
          </p>
        </div>
      ) : (
        <p
          className="mt-2 text-size-13 text-text-secondary"
          id={`${role}-wallet-content`}
        >
          {relatedWallet
            ? "Você ainda não adicionou uma carteira secundária."
            : "Cadastre a carteira principal antes de adicionar a secundária."}
        </p>
      )}
    </section>
  )
}
