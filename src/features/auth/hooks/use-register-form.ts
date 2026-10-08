import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { getApiError } from "@/shared/api"
import { useSingleFlight } from "@/shared/hooks"

import {
  registerFormSchema,
  type RegisterFormInput,
} from "../api/auth.schemas"
import { useRegisterMutation } from "./use-register-mutation"

export function useRegisterForm(onSuccess: () => void) {
  const mutation = useRegisterMutation()
  const runSingleFlight = useSingleFlight()
  const form = useForm<RegisterFormInput>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      passwordConfirmation: "",
    },
  })

  async function submit(input: RegisterFormInput) {
    await runSingleFlight(async () => {
      form.clearErrors("root.server")
      mutation.reset()

      try {
        await mutation.mutateAsync({
          username: input.username,
          email: input.email,
          password: input.password,
        })
        onSuccess()
      } catch (error) {
        const apiError = getApiError(error)

        if (apiError?.code === "EMAIL_ALREADY_EXISTS") {
          form.setError(
            "email",
            {
              message: "Este e-mail já está cadastrado.",
              type: "server",
            },
            { shouldFocus: true },
          )
          return
        }

        if (apiError?.code === "USERNAME_ALREADY_EXISTS") {
          form.setError(
            "username",
            {
              message: "Este nome de usuário já está em uso.",
              type: "server",
            },
            { shouldFocus: true },
          )
          return
        }

        form.setError("root.server", {
          message: "Não foi possível criar sua conta. Tente novamente.",
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
