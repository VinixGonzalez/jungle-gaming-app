import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { getApiError } from "@/shared/api"
import { useSingleFlight } from "@/shared/hooks"

import {
  profileFormSchema,
  type CollectorProfile,
  type ProfileFormInput,
} from "../api/account.schemas"
import { useUpdateProfileMutation } from "./use-update-profile-mutation"

function getEnsLabel(ensName: string) {
  return ensName.endsWith(".eth") ? ensName.slice(0, -4) : ensName
}

export function useProfileForm(profile: CollectorProfile) {
  const mutation = useUpdateProfileMutation()
  const runSingleFlight = useSingleFlight()
  const [feedback, setFeedback] = useState<string | null>(null)
  const form = useForm<ProfileFormInput>({
    resolver: zodResolver(profileFormSchema),
    values: {
      displayName: profile.displayName,
      email: profile.email,
      ensLabel: getEnsLabel(profile.ensName ?? ""),
      username: profile.username,
      walletAlias: profile.walletAlias,
    },
  })

  async function submit(input: ProfileFormInput) {
    await runSingleFlight(async () => {
      setFeedback(null)
      form.clearErrors("root.server")
      mutation.reset()

      if (profile.walletAlias && !input.walletAlias) {
        form.setError(
          "walletAlias",
          {
            message: "Informe o apelido da carteira principal.",
            type: "validate",
          },
          { shouldFocus: true },
        )
        return
      }

      try {
        const updatedProfile = await mutation.mutateAsync({
          displayName: input.displayName,
          email: input.email,
          ensName: `${input.ensLabel}.eth`,
          username: input.username,
          walletAlias: input.walletAlias || null,
        })

        form.reset({
          displayName: updatedProfile.displayName,
          email: updatedProfile.email,
          ensLabel: getEnsLabel(updatedProfile.ensName ?? ""),
          username: updatedProfile.username,
          walletAlias: updatedProfile.walletAlias,
        })
        setFeedback("Perfil atualizado com sucesso.")
      } catch (error) {
        const apiError = getApiError(error)

        if (apiError?.code === "EMAIL_ALREADY_EXISTS") {
          form.setError(
            "email",
            { message: "Este e-mail já está cadastrado.", type: "server" },
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

        if (
          apiError?.code === "PRIMARY_WALLET_REQUIRED" ||
          apiError?.code === "WALLET_ALIAS_REQUIRED"
        ) {
          form.setError(
            "walletAlias",
            {
              message:
                apiError.code === "PRIMARY_WALLET_REQUIRED"
                  ? "Cadastre uma carteira principal antes do apelido."
                  : "Informe o apelido da carteira principal.",
              type: "server",
            },
            { shouldFocus: true },
          )
          return
        }

        form.setError("root.server", {
          message: "Não foi possível atualizar o perfil. Tente novamente.",
          type: "server",
        })
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
