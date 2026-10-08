import { Link } from "@tanstack/react-router"
import { Heart } from "lucide-react"

import { Button } from "@/shared/components/ui/button"

export function FavoritesEmptyState() {
  return (
    <div className="mt-8 flex flex-col items-center rounded-lg border border-border bg-surface-card/35 px-6 py-14 text-center">
      <Heart aria-hidden="true" className="size-10 text-text-accent" />
      <h2 className="mt-4 text-size-18 font-bold">
        Sua lista de interesse está vazia
      </h2>
      <p className="mt-2 max-w-100 text-size-13 leading-size-20 text-text-secondary">
        Favorite obras no detalhe do NFT para encontrá-las aqui.
      </p>
      <Button asChild className="mt-6">
        <Link hash="catalogo" to="/">
          Explorar NFTs
        </Link>
      </Button>
    </div>
  )
}
