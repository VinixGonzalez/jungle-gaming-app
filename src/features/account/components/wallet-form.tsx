import type {
  Wallet,
  WalletConnection,
  WalletRole,
} from "@/features/wallets"
import { walletFieldLimits } from "@/features/wallets/contracts"
import { Button } from "@/shared/components/ui/button"
import { FormField } from "@/shared/components/ui/form-field"
import { Input } from "@/shared/components/ui/input"
import { Select } from "@/shared/components/ui/select"

import type { CollectorProfile } from "../api/account.schemas"
import { useWalletForm } from "../hooks/use-wallet-form"

interface WalletFormProps {
  connection: WalletConnection | null
  onSaved?: () => void
  profile: CollectorProfile
  relatedWallet?: Wallet
  role: WalletRole
  wallet?: Wallet
}

function getEnsLabel(ensName: string | null) {
  if (!ensName) return ""

  return ensName.endsWith(".eth") ? ensName.slice(0, -4) : ensName
}

export function WalletForm({
  connection,
  onSaved,
  profile,
  relatedWallet,
  role,
  wallet,
}: WalletFormProps) {
  const form = useWalletForm({ onSaved, userId: profile.id, wallet })
  const isConnected = connection?.walletId === wallet?.id
  const roleLabel = role === "primary" ? "Principal" : "Secundária"
  const readOnlyClassName = "bg-surface-card/40 text-text-secondary"

  return (
    <form
      aria-busy={form.isPending}
      noValidate
      onSubmit={form.handleSubmit(form.submit)}
    >
      <div className="grid gap-x-5 gap-y-5 md:grid-cols-2 xl:gap-x-5.25 xl:gap-y-6">
        <FormField
          htmlFor={`${role}-display-name`}
          label="Nome de exibição"
          required
        >
          <Input
            className={readOnlyClassName}
            id={`${role}-display-name`}
            readOnly
            value={profile.displayName}
          />
        </FormField>

        <FormField
          error={form.errors.label?.message}
          htmlFor={`${role}-wallet-label`}
          label="Apelido da carteira"
          required
        >
          <Input
            {...form.register("label")}
            aria-describedby={
              form.errors.label ? `${role}-wallet-label-error` : undefined
            }
            aria-invalid={Boolean(form.errors.label)}
            id={`${role}-wallet-label`}
            maxLength={walletFieldLimits.label}
            readOnly={form.isPending}
            required
          />
        </FormField>

        <FormField
          error={form.errors.network?.message}
          htmlFor={`${role}-wallet-network`}
          label="Rede"
          required
        >
          <Select
            {...form.register("network")}
            aria-describedby={
              form.errors.network
                ? `${role}-wallet-network-error`
                : undefined
            }
            aria-invalid={Boolean(form.errors.network)}
            disabled={form.isPending}
            id={`${role}-wallet-network`}
            required
          >
            <option value="ethereum">Ethereum</option>
            <option value="polygon">Polygon</option>
            <option value="solana">Solana</option>
          </Select>
        </FormField>

        <FormField
          htmlFor={`${role}-profile-name`}
          label="Nome do perfil"
          required
        >
          <Input
            className={readOnlyClassName}
            id={`${role}-profile-name`}
            readOnly
            value={`@${profile.username}`}
          />
        </FormField>

        <FormField
          error={form.errors.address?.message}
          htmlFor={`${role}-wallet-address`}
          label="Endereço da carteira"
          required
        >
          <Input
            {...form.register("address")}
            aria-describedby={
              form.errors.address
                ? `${role}-wallet-address-error`
                : undefined
            }
            aria-invalid={Boolean(form.errors.address)}
            autoCapitalize="none"
            id={`${role}-wallet-address`}
            maxLength={walletFieldLimits.address}
            readOnly={form.isPending}
            placeholder="Endereço da carteira"
            required
            spellCheck={false}
          />
        </FormField>

        <FormField
          htmlFor={`${role}-related-wallet`}
          label="Carteira relacionada"
        >
          <Input
            className={readOnlyClassName}
            id={`${role}-related-wallet`}
            placeholder="Nenhuma outra carteira cadastrada"
            readOnly
            value={relatedWallet?.address ?? ""}
          />
        </FormField>

        <FormField
          htmlFor={`${role}-wallet-role`}
          label="Tipo de carteira"
          required
        >
          <Input
            className={readOnlyClassName}
            id={`${role}-wallet-role`}
            readOnly
            value={roleLabel}
          />
        </FormField>

        <FormField
          htmlFor={`${role}-wallet-status`}
          label="Status da conexão"
        >
          <Input
            className={readOnlyClassName}
            id={`${role}-wallet-status`}
            readOnly
            value={isConnected ? "Conectada" : "Desconectada"}
          />
        </FormField>

        <FormField
          htmlFor={`${role}-wallet-email`}
          label="E-mail"
          required
        >
          <Input
            className={readOnlyClassName}
            id={`${role}-wallet-email`}
            readOnly
            type="email"
            value={profile.email}
          />
        </FormField>

        <FormField
          htmlFor={`${role}-wallet-ens`}
          label="Nome ENS"
          required
        >
          <div className="flex gap-2.5">
            <span
              aria-hidden="true"
              className="flex h-10 w-19.5 shrink-0 items-center rounded-md border border-input bg-surface-card/40 px-2.5 text-size-14 text-text-secondary"
            >
              .eth
            </span>
            <Input
              className={readOnlyClassName}
              id={`${role}-wallet-ens`}
              readOnly
              value={getEnsLabel(profile.ensName)}
            />
          </div>
        </FormField>
      </div>

      {form.errors.root?.server?.message ? (
        <p className="mt-5 text-size-12 text-error-text" role="alert">
          {form.errors.root.server.message}
        </p>
      ) : null}
      {form.feedback ? (
        <p className="mt-5 text-size-12 text-success" role="status">
          {form.feedback}
        </p>
      ) : null}

      <Button
        className="mt-6 h-10 min-w-32.75 px-4 text-size-14 font-bold"
        disabled={form.isPending}
        type="submit"
      >
        {form.isPending ? "Salvando..." : "Salvar carteira"}
      </Button>
    </form>
  )
}
