import { Button } from "@/shared/components/ui/button"

import { authFieldLimits } from "../config/auth-field-limits"
import { useLoginForm } from "../hooks/use-login-form"
import { AuthField } from "./auth-field"

interface LoginFormProps {
  onSuccess: () => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const form = useLoginForm(onSuccess)
  const serverError = form.errors.root?.server?.message

  return (
    <form
      aria-busy={form.isPending}
      className="contents"
      noValidate
      onSubmit={form.handleSubmit(form.submit)}
    >
      <div className="flex w-full flex-col gap-3 xl:px-20 xl:pt-6">
        <AuthField
          autoComplete="email"
          data-auth-autofocus
          error={form.errors.email?.message}
          id="login-email"
          label="E-mail"
          maxLength={authFieldLimits.email}
          placeholder="contato@email.com"
          readOnly={form.isPending}
          required
          type="email"
          {...form.register("email")}
        />
        <AuthField
          autoComplete="current-password"
          error={form.errors.password?.message}
          id="login-password"
          label="Senha"
          maxLength={authFieldLimits.password}
          password
          placeholder="Senha"
          readOnly={form.isPending}
          required
          type="password"
          {...form.register("password")}
        />
        <Button
          className="h-auto self-end p-0 text-size-14 leading-size-16 font-normal text-text-accent disabled:opacity-100"
          disabled
          title="Recuperação de senha não está disponível nesta demonstração."
          type="button"
          variant="link"
        >
          Esqueceu a senha?
        </Button>

        {serverError ? (
          <p className="text-size-12 leading-size-16 text-error-text" role="alert">
            {serverError}
          </p>
        ) : null}
      </div>

      <div className="w-full xl:px-20 xl:pt-6">
        <Button
          className="h-15 w-full rounded-xl text-size-16 leading-size-16 font-bold xl:h-11.25 xl:rounded-control"
          disabled={form.isPending}
          type="submit"
        >
          {form.isPending ? "Entrando..." : "Entrar"}
        </Button>
      </div>
    </form>
  )
}
