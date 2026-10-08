import { Link } from "@tanstack/react-router"
import { ShoppingCart } from "lucide-react"

import { Badge } from "@/shared/components/ui/badge"
import { BrandWordmark } from "@/shared/components/ui/brand-wordmark"

interface AccountMobileHeaderProps {
  cartCount: number
}

export function AccountMobileHeader({
  cartCount,
}: AccountMobileHeaderProps) {
  const visibleCount = cartCount > 99 ? "99+" : cartCount

  return (
    <header className="flex h-17 items-center justify-between border-b border-border px-page-mobile xl:hidden">
      <BrandWordmark
        aria-label="Kurio — página inicial"
        href="/#inicio"
        name="KURIO"
      />
      <Link
        aria-label={`Carrinho, ${cartCount} ${cartCount === 1 ? "item" : "itens"}`}
        className="relative grid size-11 place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
        to="/cart"
      >
        <ShoppingCart aria-hidden="true" className="size-5.5" />
        {cartCount > 0 ? (
          <Badge className="absolute top-1 right-0 h-5 min-w-5 border-2 border-ink bg-primary px-1 py-0 text-size-10 leading-none text-ink">
            {visibleCount}
          </Badge>
        ) : null}
      </Link>
    </header>
  )
}
