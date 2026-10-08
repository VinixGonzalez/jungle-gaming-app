import type {
  FieldErrors,
  UseFormRegister,
} from "react-hook-form"

import { FormField } from "@/shared/components/ui/form-field"
import { Input } from "@/shared/components/ui/input"
import { Textarea } from "@/shared/components/ui/textarea"
import { cn } from "@/shared/utils"
import { authFieldLimits } from "@/features/auth/contracts"

import { checkoutFieldLimits } from "../config/checkout-field-limits"
import type { CollectorData } from "../contracts"

interface CollectorDataFieldsProps {
  errors: FieldErrors<CollectorData>
  register: UseFormRegister<CollectorData>
  className?: string
}

export function CollectorDataFields({
  errors,
  register,
  className,
}: CollectorDataFieldsProps) {
  return (
    <div className={cn("grid gap-x-7 gap-y-4 md:grid-cols-2", className)}>
      <FormField
        error={errors.displayName?.message}
        htmlFor="collector-display-name"
        label="Nome de exibição"
        required
      >
        <Input
          aria-describedby={
            errors.displayName ? "collector-display-name-error" : undefined
          }
          aria-invalid={Boolean(errors.displayName)}
          autoComplete="name"
          id="collector-display-name"
          maxLength={authFieldLimits.displayName}
          required
          {...register("displayName")}
        />
      </FormField>

      <FormField
        error={errors.username?.message}
        htmlFor="collector-username"
        label="Nome de usuário"
        required
      >
        <Input
          aria-describedby={
            errors.username ? "collector-username-error" : undefined
          }
          aria-invalid={Boolean(errors.username)}
          autoComplete="username"
          id="collector-username"
          maxLength={authFieldLimits.username}
          required
          {...register("username")}
        />
      </FormField>

      <FormField
        error={errors.profileName?.message}
        htmlFor="collector-profile-name"
        label="Nome do perfil"
      >
        <Input
          aria-describedby={
            errors.profileName ? "collector-profile-name-error" : undefined
          }
          aria-invalid={Boolean(errors.profileName)}
          id="collector-profile-name"
          maxLength={checkoutFieldLimits.profileName}
          {...register("profileName")}
        />
      </FormField>

      <FormField
        error={errors.secondaryEns?.message}
        htmlFor="collector-secondary-ens"
        label="ENS secundário"
      >
        <Input
          aria-describedby={
            errors.secondaryEns ? "collector-secondary-ens-error" : undefined
          }
          aria-invalid={Boolean(errors.secondaryEns)}
          id="collector-secondary-ens"
          maxLength={authFieldLimits.ensName}
          placeholder="nome.eth"
          {...register("secondaryEns")}
        />
      </FormField>

      <FormField
        error={errors.referralCode?.message}
        htmlFor="collector-referral-code"
        label="Código de indicação"
      >
        <Input
          aria-describedby={
            errors.referralCode ? "collector-referral-code-error" : undefined
          }
          aria-invalid={Boolean(errors.referralCode)}
          id="collector-referral-code"
          maxLength={checkoutFieldLimits.referralCode}
          {...register("referralCode")}
        />
      </FormField>

      <FormField
        error={errors.ensName?.message}
        htmlFor="collector-ens-name"
        label="Nome ENS"
      >
        <Input
          aria-describedby={
            errors.ensName ? "collector-ens-name-error" : undefined
          }
          aria-invalid={Boolean(errors.ensName)}
          id="collector-ens-name"
          maxLength={authFieldLimits.ensName}
          placeholder="nome.eth"
          {...register("ensName")}
        />
      </FormField>

      <FormField
        error={errors.email?.message}
        htmlFor="collector-email"
        label="E-mail"
        required
      >
        <Input
          aria-describedby={errors.email ? "collector-email-error" : undefined}
          aria-invalid={Boolean(errors.email)}
          autoComplete="email"
          id="collector-email"
          maxLength={authFieldLimits.email}
          required
          type="email"
          {...register("email")}
        />
      </FormField>

      <FormField
        className="md:col-span-2"
        error={errors.notes?.message}
        htmlFor="collector-notes"
        label="Observações para o colecionador"
      >
        <Textarea
          aria-describedby={errors.notes ? "collector-notes-error" : undefined}
          aria-invalid={Boolean(errors.notes)}
          className="min-h-32"
          id="collector-notes"
          maxLength={checkoutFieldLimits.notes}
          {...register("notes")}
        />
      </FormField>
    </div>
  )
}
