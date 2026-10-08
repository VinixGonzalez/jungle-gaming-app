import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/utils"

interface CatalogErrorStateProps {
  className?: string
  onRetry: () => void
}

export function CatalogErrorState({
  className,
  onRetry,
}: CatalogErrorStateProps) {
  return (
    <div
      className={cn(
        "flex w-full flex-col items-center justify-center gap-4 py-16 text-center",
        className,
      )}
      role="alert"
    >
      <p className="text-size-16 text-text-secondary">
        Não foi possível carregar o catálogo.
      </p>
      <Button onClick={onRetry} type="button">
        Tentar novamente
      </Button>
    </div>
  )
}
