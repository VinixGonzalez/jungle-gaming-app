import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { getApiError } from "@/shared/api"
import { useSingleFlight } from "@/shared/hooks"

import {
  loginInputSchema,
  type LoginInput,
} from "../api/auth.schemas"
import { useLoginMutation } from "./use-login-mutation"

function getLoginErrorMessage(error: unknown) {
  const apiError = getApiError(error)

  if (apiError?.code === "INVALID_CREDENTIALS") {
    return "E-mail ou senha inválidos."
  }

  return "Não foi possível entrar. Tente novamente."
}

export function useLoginForm(onSuccess: () => void) {
  const mutation = useLoginMutation()
  const runSingleFlight = useSingleFlight()
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginInputSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function submit(input: LoginInput) {
    await runSingleFlight(async () => {
      form.clearErrors("root.server")
      mutation.reset()

      try {
        await mutation.mutateAsync(input)
        onSuccess()
      } catch (error) {
        form.setError("root.server", {
          message: getLoginErrorMessage(error),
          type: "server",
        })
      }
    })
  }

  return {
    errors: form.formState.errors,
    handleSubmit: form.handleSubmit,
    isPending: form.formState.isSubmitting || mutation.isPending,
    register: form.register,
    submit,
  }
}
