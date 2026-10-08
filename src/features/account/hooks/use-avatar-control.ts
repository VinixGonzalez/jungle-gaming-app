import { useState } from "react"

import { getApiError } from "@/shared/api"
import { useSingleFlight } from "@/shared/hooks"

import { readAvatarFile } from "../model/read-avatar-file"
import { validateAvatarFile } from "../model/validate-avatar-file"
import { useRemoveAvatarMutation } from "./use-remove-avatar-mutation"
import { useUpdateAvatarMutation } from "./use-update-avatar-mutation"

export function useAvatarControl() {
  const runSingleFlight = useSingleFlight()
  const updateMutation = useUpdateAvatarMutation()
  const removeMutation = useRemoveAvatarMutation()
  const [isProcessing, setIsProcessing] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function performUpdate(file: File) {
    setError(null)
    setFeedback(null)

    const validationError = validateAvatarFile(file)

    if (validationError) {
      setError(validationError)
      return
    }

    try {
      const dataUrl = await readAvatarFile(file)
      await updateMutation.mutateAsync({ dataUrl })
      setFeedback("Avatar atualizado com sucesso.")
    } catch (cause) {
      setError(
        getApiError(cause)?.code === "INVALID_PROFILE_REQUEST"
          ? "A imagem selecionada não é válida."
          : "Não foi possível atualizar o avatar. Tente novamente.",
      )
    }
  }

  async function performRemove() {
    setError(null)
    setFeedback(null)

    try {
      await removeMutation.mutateAsync()
      setFeedback("Avatar removido com sucesso.")
    } catch {
      setError("Não foi possível remover o avatar. Tente novamente.")
    }
  }

  async function update(file: File) {
    await runSingleFlight(async () => {
      setIsProcessing(true)

      try {
        await performUpdate(file)
      } finally {
        setIsProcessing(false)
      }
    })
  }

  async function remove() {
    await runSingleFlight(async () => {
      setIsProcessing(true)

      try {
        await performRemove()
      } finally {
        setIsProcessing(false)
      }
    })
  }

  return {
    error,
    feedback,
    isPending:
      isProcessing || updateMutation.isPending || removeMutation.isPending,
    remove,
    update,
  }
}
