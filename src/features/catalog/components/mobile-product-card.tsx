import { Link } from "@tanstack/react-router"

import { Badge } from "@/shared/components/ui/badge"
import { formatEth } from "@/shared/utils"

import type { CatalogItem } from "../api/catalog.schemas"

interface MobileProductCardProps {
  priority?: boolean
  product: CatalogItem
}

export function MobileProductCard({
  priority = false,
  product,
}: MobileProductCardProps) {
  const isSoldOut = product.availableQuantity === 0

  return (
    <article className="w-full">
      <Link
        aria-label={`Ver detalhes de ${product.name}`}
        className="flex w-full flex-col items-start gap-2 rounded-4xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-ink"
        params={{ slug: product.slug }}
        to="/nfts/$slug"
      >
        <div className="relative aspect-175/200 w-full shrink-0 overflow-hidden rounded-4xl bg-[linear-gradient(139.548deg,#241612_11.999%,#2f1d15_106.59%)]">
          <img
            alt=""
            className="absolute left-[2.286%] top-[8%] aspect-square w-[96%] max-w-none rounded-3xl object-cover"
            {...{ fetchpriority: priority ? "high" : "auto" }}
            loading={priority ? "eager" : "lazy"}
            src={product.thumbnailUrl}
          />

          {isSoldOut ? (
            <Badge className="absolute top-[8%] left-0 h-8 rounded-none border-0 px-2 text-size-12 leading-size-16 font-medium">
              ESGOTADO
            </Badge>
          ) : null}
        </div>

        <div className="flex w-full flex-col items-start pl-2">
          <h3 className="w-full text-size-15 leading-normal font-normal text-foreground">
            {product.name}
          </h3>
          <p className="w-full text-size-16 leading-size-16 font-bold text-text-accent">
            {formatEth(product.priceEth)}
          </p>
        </div>
      </Link>
    </article>
  )
}
