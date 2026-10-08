import type { ReactNode, Ref } from "react"
import { Search, ShoppingCart } from "lucide-react"

import { Badge } from "@/shared/components/ui/badge"
import { BrandWordmark } from "@/shared/components/ui/brand-wordmark"
import { IconButton } from "@/shared/components/ui/icon-button"
import { cn } from "@/shared/utils/cn"

type SiteBrand = {
  name: string
  href: string
  ariaLabel?: string
}

type HeaderNavigationItem = {
  label: string
  href: string
  active?: boolean
}

type HeaderCart = {
  href: string
  count: number
  label?: string
  ariaLabel?: string
}

type HeaderSearch = {
  controls?: string
  expanded?: boolean
  label: string
  onClick?: () => void
}

type SiteHeaderProps = {
  brand: SiteBrand
  navigation: readonly HeaderNavigationItem[]
  search: HeaderSearch
  cart: HeaderCart
  accountAction: ReactNode
  searchButtonRef?: Ref<HTMLButtonElement>
  className?: string
}

function SiteHeader({
  brand,
  navigation,
  search,
  cart,
  accountAction,
  searchButtonRef,
  className,
}: SiteHeaderProps) {
  const cartItemLabel = cart.count === 1 ? "item" : "itens"
  const cartLabel =
    cart.ariaLabel ??
    `${cart.label ?? "Carrinho"}, ${cart.count} ${cartItemLabel}`
  const visibleCartCount = cart.count > 99 ? "99+" : cart.count

  return (
    <header
      className={cn(
        "mx-auto hidden h-11.25 w-full max-w-content xl:block",
        className,
      )}
    >
      <div className="relative flex h-full items-start justify-between border-b-[0.3px] border-primary">
        <BrandWordmark
          className="relative h-[34.3px] w-40 shrink-0 items-start pt-[8.15px]"
          href={brand.href}
          name={brand.name}
          aria-label={brand.ariaLabel}
        />

        <nav aria-label="Navegação principal">
          <ul className="flex items-start gap-10">
            {navigation.map((item) => (
              <li key={item.href}>
                <a
                  className={cn(
                    "relative flex items-start text-size-16 leading-normal outline-none transition-colors hover:text-primary focus-visible:text-primary",
                    item.active
                      ? "font-bold text-text-accent after:absolute after:inset-x-0 after:top-10.5 after:h-0.75 after:rounded-full after:bg-primary after:content-['']"
                      : "font-normal text-foreground",
                  )}
                  href={item.href}
                  aria-current={item.active ? "page" : undefined}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex h-8.75 shrink-0 items-center gap-7">
          <IconButton
            ref={searchButtonRef}
            aria-controls={search.controls}
            aria-expanded={search.onClick ? search.expanded : undefined}
            aria-haspopup={search.onClick ? "dialog" : undefined}
            className="size-5 bg-transparent p-0 text-foreground hover:bg-transparent hover:text-primary disabled:cursor-not-allowed disabled:opacity-100"
            disabled={!search.onClick}
            label={search.label}
            onClick={search.onClick}
            variant="ghost"
          >
            <Search className="size-5" aria-hidden="true" />
          </IconButton>

          <a
            className="relative h-6 w-7.75 rounded-sm text-foreground outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
            href={cart.href}
            aria-label={cartLabel}
          >
            <ShoppingCart className="absolute left-0 top-0 size-6" aria-hidden="true" />
            {cart.count > 0 ? (
              <Badge
                className="absolute left-3.75 -top-0.5 h-5 min-w-5 border-2 border-ink bg-primary px-1 py-0 text-size-10 font-medium leading-none text-ink"
                aria-hidden="true"
              >
                {visibleCartCount}
              </Badge>
            ) : null}
          </a>

          {accountAction}
        </div>
      </div>
    </header>
  )
}

export { SiteHeader }
