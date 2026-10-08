import { Button } from "@/shared/components/ui/button"

interface FavoritesErrorStateProps {
  onRetry: () => void
}

export function FavoritesErrorState({
  onRetry,
}: FavoritesErrorStateProps) {
  return (
    <section
      className="rounded-lg border border-error-text/40 bg-surface-card p-6"
      role="alert"
    >
      <h1 className="text-size-18 font-bold">
        Não foi possível carregar os favoritos
      </h1>
      <p className="mt-2 text-size-13 text-text-secondary">
        Verifique sua conexão e tente novamente.
      </p>
      <Button className="mt-5" onClick={onRetry} type="button">
        Tentar novamente
      </Button>
    </section>
  )
}
