import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"

import {
  createWalletInputSchema,
  useCreateWalletMutation,
  useUpdateWalletMutation,
  type CreateWalletInput,
  type Wallet,
} from "@/features/wallets"
import { getApiError } from "@/shared/api"
import { useSingleFlight } from "@/shared/hooks"

import { accountQueryKeys } from "../query/account-query-keys"

interface UseWalletFormOptions {
  onSaved?: () => void
  userId: string
  wallet?: Wallet
}

export function useWalletForm({
  onSaved,
  userId,
  wallet,
}: UseWalletFormOptions) {
  const queryClient = useQueryClient()
  const runSingleFlight = useSingleFlight()
  const createMutation = useCreateWalletMutation(userId)
  const updateMutation = useUpdateWalletMutation(userId)
  const [feedback, setFeedback] = useState<string | null>(null)
  const form = useForm<CreateWalletInput>({
    resolver: zodResolver(createWalletInputSchema),
    values: {
      address: wallet?.address ?? "",
      label: wallet?.label ?? "",
      network: wallet?.network ?? "ethereum",
    },
  })

  async function submit(input: CreateWalletInput) {
    await runSingleFlight(async () => {
      form.clearErrors("root.server")
      setFeedback(null)
      createMutation.reset()
      updateMutation.reset()

      try {
        if (wallet) {
          await updateMutation.mutateAsync({ input, walletId: wallet.id })
        } else {
          await createMutation.mutateAsync(input)
        }

        await queryClient.invalidateQueries({
          queryKey: accountQueryKeys.profile(userId),
        })
        setFeedback(
          wallet
            ? "Carteira atualizada com sucesso."
            : "Carteira cadastrada com sucesso.",
        )
        onSaved?.()
      } catch (error) {
        const apiError = getApiError(error)

        if (apiError?.code === "WALLET_ALREADY_REGISTERED") {
          form.setError(
            "address",
            {
              message: "Este endereço já está cadastrado.",
              type: "server",
            },
            { shouldFocus: true },
          )
          return
        }

        const addressError = apiError?.fieldErrors?.address?.[0]

        if (addressError) {
          form.setError(
            "address",
            {
              message: "Informe um endereço válido para a rede.",
              type: "server",
            },
            { shouldFocus: true },
          )
          return
        }

        form.setError("root.server", {
          message:
            apiError?.code === "WALLET_LIMIT_REACHED"
              ? "Você pode cadastrar no máximo duas carteiras."
              : "Não foi possível salvar a carteira. Tente novamente.",
          type: "server",
        })
      }
    })
  }

  return {
    errors: form.formState.errors,
    feedback,
    handleSubmit: form.handleSubmit,
    isPending:
      form.formState.isSubmitting ||
      createMutation.isPending ||
      updateMutation.isPending,
    register: form.register,
    submit,
  }
}
