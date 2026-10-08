import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { getApiError } from "@/shared/api"
import { useSingleFlight } from "@/shared/hooks"

import {
  changePasswordFormSchema,
  type ChangePasswordFormInput,
} from "../api/account.schemas"
import { useChangePasswordMutation } from "./use-change-password-mutation"

export function usePasswordForm() {
  const mutation = useChangePasswordMutation()
  const runSingleFlight = useSingleFlight()
  const [feedback, setFeedback] = useState<string | null>(null)
  const form = useForm<ChangePasswordFormInput>({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      passwordConfirmation: "",
    },
  })

  async function submit(input: ChangePasswordFormInput) {
    await runSingleFlight(async () => {
      setFeedback(null)
      form.clearErrors("root.server")
      mutation.reset()

      try {
        await mutation.mutateAsync({
          currentPassword: input.currentPassword,
          newPassword: input.newPassword,
        })
        form.reset()
        setFeedback("Senha alterada com sucesso.")
      } catch (error) {
        const apiError = getApiError(error)

        if (apiError?.code === "INVALID_CURRENT_PASSWORD") {
          form.setError(
            "currentPassword",
            { message: "A senha atual está incorreta.", type: "server" },
            { shouldFocus: true },
          )
          return
        }

        form.setError("root.server", {
          message: "Não foi possível alterar a senha. Tente novamente.",
          type: "server",
        })
      } finally {
        mutation.reset()
      }
    })
  }

  return {
    errors: form.formState.errors,
    feedback,
    handleSubmit: form.handleSubmit,
    isPending: form.formState.isSubmitting || mutation.isPending,
    register: form.register,
    submit,
  }
}
