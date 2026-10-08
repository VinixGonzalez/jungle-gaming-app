import { Link } from "@tanstack/react-router"

import type { CatalogItem } from "@/features/catalog/contracts"
import { formatEth } from "@/shared/utils"

interface CartRecommendationsProps {
  products: readonly CatalogItem[]
}

export function CartRecommendations({ products }: CartRecommendationsProps) {
  if (products.length === 0) return null

  return (
    <section aria-labelledby="cart-recommendations-title">
      <h2
        className="text-size-20 leading-size-28 font-bold text-foreground"
        id="cart-recommendations-title"
      >
        Talvez você também goste
      </h2>

      <ul className="mt-8 grid grid-cols-5 gap-6">
        {products.map((product) => (
          <li className="min-w-0" key={product.id}>
            <article>
              <Link
                aria-label={`Ver detalhes de ${product.name}`}
                className="group flex min-w-0 flex-col gap-3 rounded-artwork outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-ink"
                params={{ slug: product.slug }}
                to="/nfts/$slug"
              >
                <div className="h-63.75 overflow-hidden rounded-artwork bg-surface-card p-2">
                  <img
                    alt=""
                    className="size-full rounded-xl object-cover transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transition-none"
                    src={product.imageUrl}
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-size-15 leading-size-20 text-foreground group-hover:text-primary">
                    {product.name}
                  </h3>
                  <p className="mt-2 text-size-16 leading-size-20 font-bold text-text-accent">
                    {formatEth(product.priceEth)}
                  </p>
                </div>
              </Link>
            </article>
          </li>
        ))}
      </ul>
    </section>
  )
}
