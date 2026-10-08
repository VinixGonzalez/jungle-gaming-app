import { Button } from "@/shared/components/ui/button"

interface CheckoutStateProps {
  kind: "authentication-required" | "loading" | "error" | "empty"
  message?: string
  onBack: () => void
  onRetry: () => void
}

const stateCopy = {
  "authentication-required": {
    title: "Sua sessão precisa ser renovada",
    description: "Seu checkout foi salvo e poderá ser retomado após entrar.",
  },
  loading: {
    title: "Preparando seu checkout",
    description: "Estamos carregando suas carteiras e os valores atuais.",
  },
  error: {
    title: "Não foi possível abrir o checkout",
    description: "Tente carregar os dados novamente.",
  },
  empty: {
    title: "Seu carrinho está vazio",
    description: "Adicione um NFT antes de iniciar o pagamento.",
  },
} as const

export function CheckoutState({
  kind,
  message,
  onBack,
  onRetry,
}: CheckoutStateProps) {
  const copy = stateCopy[kind]

  return (
    <main className="mx-auto grid min-h-[60svh] w-full max-w-content place-items-center px-6 py-16 text-center">
      <div className="max-w-lg">
        <h1 className="text-size-24 leading-size-32 font-bold">{copy.title}</h1>
        <p className="mt-3 text-size-13 leading-size-20 text-text-secondary">
          {message ?? copy.description}
        </p>
        {kind === "loading" || kind === "authentication-required" ? (
          <p className="mt-5 text-size-11 text-text-muted" role="status">
            Aguarde…
          </p>
        ) : (
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button
              className="h-10 rounded-full px-5"
              onClick={onBack}
              type="button"
              variant="outline"
            >
              Voltar
            </Button>
            {kind === "error" ? (
              <Button
                className="h-10 rounded-full px-5"
                onClick={onRetry}
                type="button"
              >
                Tentar novamente
              </Button>
            ) : null}
          </div>
        )}
      </div>
    </main>
  )
}
