import { AlertTriangle } from "lucide-react"

import { Button } from "@/shared/components/ui/button"

interface ProfileErrorStateProps {
  onRetry: () => void
}

export function ProfileErrorState({ onRetry }: ProfileErrorStateProps) {
  return (
    <div
      className="rounded-lg border border-error-text/40 bg-surface-card p-6"
      role="alert"
    >
      <AlertTriangle
        aria-hidden="true"
        className="mb-4 size-6 text-error-text"
      />
      <h1 className="text-size-18 font-bold">Não foi possível carregar o perfil</h1>
      <p className="mt-2 text-size-13 text-text-secondary">
        Verifique sua conexão e tente novamente.
      </p>
      <Button className="mt-5" onClick={onRetry} type="button">
        Tentar novamente
      </Button>
    </div>
  )
}
