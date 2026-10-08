import { Button } from "@/shared/components/ui/button"
import { FormField } from "@/shared/components/ui/form-field"
import { Input } from "@/shared/components/ui/input"
import { authFieldLimits } from "@/features/auth/contracts"
import { walletFieldLimits } from "@/features/wallets/contracts"

import type { CollectorProfile } from "../api/account.schemas"
import { useProfileForm } from "../hooks/use-profile-form"
import { ProfileAvatarField } from "./profile-avatar-field"

interface ProfileDetailsFormProps {
  profile: CollectorProfile
}

export function ProfileDetailsForm({
  profile,
}: ProfileDetailsFormProps) {
  const form = useProfileForm(profile)

  return (
    <form
      aria-busy={form.isPending}
      className="mt-6"
      noValidate
      onSubmit={form.handleSubmit(form.submit)}
    >
      <div className="grid gap-x-7 gap-y-5 md:grid-cols-2 md:gap-y-6">
        <FormField
          error={form.errors.displayName?.message}
          htmlFor="profile-display-name"
          label="Nome de exibição"
          required
        >
          <Input
            {...form.register("displayName")}
            aria-describedby={
              form.errors.displayName
                ? "profile-display-name-error"
                : undefined
            }
            aria-invalid={Boolean(form.errors.displayName)}
            autoComplete="name"
            id="profile-display-name"
            maxLength={authFieldLimits.displayName}
            readOnly={form.isPending}
            required
          />
        </FormField>

        <FormField
          error={form.errors.username?.message}
          htmlFor="profile-username"
          label="Nome de usuário"
          required
        >
          <Input
            {...form.register("username")}
            aria-describedby={
              form.errors.username ? "profile-username-error" : undefined
            }
            aria-invalid={Boolean(form.errors.username)}
            autoComplete="username"
            id="profile-username"
            maxLength={authFieldLimits.username}
            readOnly={form.isPending}
            required
          />
        </FormField>

        <FormField
          error={form.errors.email?.message}
          htmlFor="profile-email"
          label="E-mail"
          required
        >
          <Input
            {...form.register("email")}
            aria-describedby={
              form.errors.email ? "profile-email-error" : undefined
            }
            aria-invalid={Boolean(form.errors.email)}
            autoComplete="email"
            id="profile-email"
            inputMode="email"
            maxLength={authFieldLimits.email}
            readOnly={form.isPending}
            required
            type="email"
          />
        </FormField>

        <FormField
          error={form.errors.ensLabel?.message}
          htmlFor="profile-ens-name"
          label="Nome ENS"
          required
        >
          <div className="flex gap-2.5">
            <span
              aria-hidden="true"
              className="flex h-10 w-19.5 shrink-0 items-center rounded-md border border-input px-2.5 text-size-14"
            >
              .eth
            </span>
            <Input
              {...form.register("ensLabel")}
              aria-describedby={
                form.errors.ensLabel ? "profile-ens-name-error" : undefined
              }
              aria-invalid={Boolean(form.errors.ensLabel)}
              autoCapitalize="none"
              id="profile-ens-name"
              maxLength={authFieldLimits.ensLabel}
              readOnly={form.isPending}
              required
              spellCheck={false}
            />
          </div>
        </FormField>

        <FormField
          error={form.errors.walletAlias?.message}
          htmlFor="profile-wallet-alias"
          label="Apelido da carteira"
          required={Boolean(profile.walletAlias)}
        >
          <Input
            {...form.register("walletAlias")}
            aria-describedby={
              form.errors.walletAlias
                ? "profile-wallet-alias-error"
                : !profile.walletAlias
                  ? "profile-wallet-alias-help"
                  : undefined
            }
            aria-invalid={Boolean(form.errors.walletAlias)}
            id="profile-wallet-alias"
            maxLength={walletFieldLimits.label}
            placeholder={
              profile.walletAlias ? undefined : "Cadastre uma carteira principal"
            }
            readOnly={form.isPending || !profile.walletAlias}
            required={Boolean(profile.walletAlias)}
          />
          {!profile.walletAlias ? (
            <p
              className="mt-1 text-size-11 text-text-secondary"
              id="profile-wallet-alias-help"
            >
              O apelido é gerenciado pela sua carteira principal.
            </p>
          ) : null}
        </FormField>

        <ProfileAvatarField profile={profile} />
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
        {form.isPending ? "Salvando..." : "Salvar perfil"}
      </Button>
    </form>
  )
}
