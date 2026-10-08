import { Button } from "@/shared/components/ui/button"
import { FormField } from "@/shared/components/ui/form-field"
import { PasswordInput } from "@/shared/components/ui/password-input"
import { authFieldLimits } from "@/features/auth/contracts"

import { usePasswordForm } from "../hooks/use-password-form"

export function PasswordForm() {
  const form = usePasswordForm()

  return (
    <section className="mt-8" aria-labelledby="change-password-title">
      <h2
        className="text-size-17 font-bold leading-size-20"
        id="change-password-title"
      >
        Alterar senha
      </h2>
      <form
        aria-busy={form.isPending}
        className="mt-5 max-w-104.25 space-y-5"
        noValidate
        onSubmit={form.handleSubmit(form.submit)}
      >
        <FormField
          error={form.errors.currentPassword?.message}
          htmlFor="current-password"
          label="Senha atual"
          required
        >
          <PasswordInput
            {...form.register("currentPassword")}
            aria-describedby={
              form.errors.currentPassword
                ? "current-password-error"
                : undefined
            }
            aria-invalid={Boolean(form.errors.currentPassword)}
            autoComplete="current-password"
            id="current-password"
            maxLength={authFieldLimits.password}
            readOnly={form.isPending}
            required
          />
        </FormField>

        <FormField
          error={form.errors.newPassword?.message}
          htmlFor="new-password"
          label="Nova senha"
          required
        >
          <PasswordInput
            {...form.register("newPassword")}
            aria-describedby={
              form.errors.newPassword ? "new-password-error" : undefined
            }
            aria-invalid={Boolean(form.errors.newPassword)}
            autoComplete="new-password"
            id="new-password"
            maxLength={authFieldLimits.password}
            readOnly={form.isPending}
            required
          />
        </FormField>

        <FormField
          error={form.errors.passwordConfirmation?.message}
          htmlFor="password-confirmation"
          label="Confirmar nova senha"
          required
        >
          <PasswordInput
            {...form.register("passwordConfirmation")}
            aria-describedby={
              form.errors.passwordConfirmation
                ? "password-confirmation-error"
                : undefined
            }
            aria-invalid={Boolean(form.errors.passwordConfirmation)}
            autoComplete="new-password"
            id="password-confirmation"
            maxLength={authFieldLimits.password}
            readOnly={form.isPending}
            required
          />
        </FormField>

        {form.errors.root?.server?.message ? (
          <p className="text-size-12 text-error-text" role="alert">
            {form.errors.root.server.message}
          </p>
        ) : null}
        {form.feedback ? (
          <p className="text-size-12 text-success" role="status">
            {form.feedback}
          </p>
        ) : null}

        <Button
          className="h-10 min-w-32.75 px-4 text-size-14 font-bold"
          disabled={form.isPending}
          type="submit"
        >
          {form.isPending ? "Salvando..." : "Alterar senha"}
        </Button>
      </form>
    </section>
  )
}
