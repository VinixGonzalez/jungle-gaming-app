import { Button } from "@/shared/components/ui/button"

import { authFieldLimits } from "../config/auth-field-limits"
import { useRegisterForm } from "../hooks/use-register-form"
import { AuthField } from "./auth-field"

interface RegisterFormProps {
  onSuccess: () => void
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const form = useRegisterForm(onSuccess)
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
          autoComplete="username"
          className="placeholder:text-center xl:placeholder:text-left"
          data-auth-autofocus
          error={form.errors.username?.message}
          id="register-username"
          label="Nome de usuário"
          maxLength={authFieldLimits.username}
          placeholder="Nome de usuário"
          readOnly={form.isPending}
          required
          type="text"
          {...form.register("username")}
        />
        <AuthField
          autoComplete="email"
          error={form.errors.email?.message}
          id="register-email"
          label="E-mail"
          maxLength={authFieldLimits.email}
          placeholder="Digite seu e-mail"
          readOnly={form.isPending}
          required
          type="email"
          {...form.register("email")}
        />
        <AuthField
          autoComplete="new-password"
          error={form.errors.password?.message}
          id="register-password"
          label="Senha"
          maxLength={authFieldLimits.password}
          password
          placeholder="Senha"
          readOnly={form.isPending}
          required
          type="password"
          {...form.register("password")}
        />
        <AuthField
          autoComplete="new-password"
          error={form.errors.passwordConfirmation?.message}
          id="register-password-confirmation"
          label="Confirmar senha"
          maxLength={authFieldLimits.password}
          password
          placeholder="Confirmar senha"
          readOnly={form.isPending}
          required
          type="password"
          {...form.register("passwordConfirmation")}
        />

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
          {form.isPending ? (
            "Criando conta..."
          ) : (
            <>
              <span className="xl:hidden">Criar perfil</span>
              <span className="hidden xl:inline">Criar conta</span>
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
