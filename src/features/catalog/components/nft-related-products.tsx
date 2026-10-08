import { Link } from "@tanstack/react-router"

import { formatEth } from "@/shared/utils"

import type { CatalogItem } from "../api/catalog.schemas"

interface NftRelatedProductsProps {
  products: readonly CatalogItem[]
}

export function NftRelatedProducts({ products }: NftRelatedProductsProps) {
  if (products.length === 0) return null

  return (
    <section className="flex flex-col gap-8" aria-labelledby="related-title">
      <div className="flex flex-col gap-3 border-b border-border pb-3">
        <h2
          className="text-size-17 leading-size-16 font-bold text-text-accent"
          id="related-title"
        >
          Mais desta coleção
        </h2>
      </div>
      <div className="grid grid-cols-5 gap-3">
        {products.slice(0, 5).map((product) => (
          <article className="min-w-0" key={product.id}>
            <Link
              aria-label={`Ver detalhes de ${product.name}`}
              className="flex flex-col gap-3 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-ink"
              params={{ slug: product.slug }}
              to="/nfts/$slug"
            >
              <div className="h-63.75 bg-surface-card p-3">
                <img
                  alt=""
                  className="size-full rounded-xl object-cover"
                  loading="lazy"
                  src={product.thumbnailUrl}
                />
              </div>
              <div>
                <h3 className="truncate text-size-15 leading-normal text-foreground">
                  {product.name}
                </h3>
                <p className="text-size-16 leading-size-16 font-bold text-text-accent">
                  {formatEth(product.priceEth)}
                </p>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </section>
  )
}
