import { CircleX, LoaderCircle, RefreshCw } from "lucide-react"

import { Button } from "@/shared/components/ui/button"

interface OrderStatusViewProps {
  kind: "error" | "loading" | "pending" | "refused"
  message?: string
  onBackToCart: () => void
  onRetry: () => void
}

export function OrderStatusView({
  kind,
  message,
  onBackToCart,
  onRetry,
}: OrderStatusViewProps) {
  if (kind === "loading" || kind === "pending") {
    const isLoading = kind === "loading"

    return (
      <section
        aria-label={isLoading ? "Carregando pedido" : "Pedido pendente"}
        className="mx-auto flex w-full max-w-lg flex-col items-center rounded-3xl bg-surface-card p-8 text-center"
      >
        <LoaderCircle
          aria-hidden="true"
          className="size-12 animate-spin text-primary motion-reduce:animate-none"
        />
        <h1 className="mt-5 text-size-20 font-bold">
          {isLoading ? "Carregando pedido" : "Confirmando seu pedido"}
        </h1>
        <p className="mt-3 text-size-13 leading-size-20 text-text-secondary" role="status">
          {isLoading
            ? "Aguarde enquanto recuperamos os dados da transação."
            : "A rede recebeu a transação. Esta página será atualizada automaticamente."}
        </p>
      </section>
    )
  }

  const isRefused = kind === "refused"

  return (
    <section
      className="mx-auto flex w-full max-w-lg flex-col items-center rounded-3xl bg-surface-card p-8 text-center"
      role="alert"
    >
      {isRefused ? (
        <CircleX aria-hidden="true" className="size-12 text-error-text" />
      ) : (
        <RefreshCw aria-hidden="true" className="size-12 text-primary" />
      )}
      <h1 className="mt-5 text-size-20 font-bold">
        {isRefused ? "Pagamento recusado" : "Não foi possível carregar o pedido"}
      </h1>
      <p className="mt-3 text-size-13 leading-size-20 text-text-secondary">
        {message ??
          (isRefused
            ? "Nenhum item foi removido do seu carrinho. Revise a carteira e tente novamente."
            : "Verifique sua conexão e tente novamente.")}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button onClick={onBackToCart} type="button" variant="outline">
          Voltar ao carrinho
        </Button>
        {!isRefused ? (
          <Button onClick={onRetry} type="button">
            Tentar novamente
          </Button>
        ) : null}
      </div>
    </section>
  )
}
