import { Link } from "@tanstack/react-router"

import { formatEth } from "@/shared/utils"

import type { CatalogItem } from "../api/catalog.schemas"

interface DesktopProductCardProps {
  priority?: boolean
  product: CatalogItem
}

export function DesktopProductCard({
  priority = false,
  product,
}: DesktopProductCardProps) {
  return (
    <article className="w-64.5">
      <Link
        aria-label={`Ver detalhes de ${product.name}`}
        className="flex w-full flex-col items-start gap-3 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-ink"
        params={{ slug: product.slug }}
        to="/nfts/$slug"
      >
        <div className="relative h-75 w-full shrink-0 bg-surface-card">
          <img
            alt=""
            className="absolute left-1 top-6 size-62.5 max-w-none rounded-artwork object-cover"
            {...{ fetchpriority: priority ? "high" : "auto" }}
            loading={priority ? "eager" : "lazy"}
            src={product.thumbnailUrl}
          />
        </div>

        <div className="flex w-full flex-col items-start gap-3">
          <h3 className="text-size-16 leading-size-16 font-normal text-foreground">
            {product.name}
          </h3>
          <p className="text-size-18 leading-size-16 font-bold whitespace-nowrap text-text-accent">
            {formatEth(product.priceEth)}
          </p>
        </div>
      </Link>
    </article>
  )
}
