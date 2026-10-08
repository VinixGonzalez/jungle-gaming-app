import { Link } from "@tanstack/react-router"

import { Button } from "@/shared/components/ui/button"
import { usePageTitle } from "@/shared/hooks"

export function NotFoundRoute() {
  usePageTitle("Página não encontrada | Kurio")

  return (
    <main className="grid min-h-svh place-items-center bg-ink px-6 py-16 text-foreground">
      <div className="flex w-full max-w-xl flex-col items-center gap-5 text-center">
        <p className="text-size-14 font-bold tracking-widest text-primary">
          ERRO 404
        </p>
        <h1 className="text-size-32 leading-size-40 font-bold">
          Página não encontrada
        </h1>
        <p className="max-w-lg text-size-15 leading-size-24 text-text-secondary">
          O endereço informado não existe ou não está mais disponível.
        </p>
        <Button asChild className="mt-3 min-w-44" size="lg">
          <Link to="/">Voltar ao início</Link>
        </Button>
      </div>
    </main>
  )
}
