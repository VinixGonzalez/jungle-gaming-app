import type { CatalogItem } from "../api/catalog.schemas"
import { MobileProductCard } from "./mobile-product-card"
import { MobileProductGridLayout } from "./mobile-product-grid-layout"

interface MobileProductGridProps {
  products: readonly CatalogItem[]
}

export function MobileProductGrid({ products }: MobileProductGridProps) {
  return (
    <MobileProductGridLayout>
      {products.map((product, index) => (
        <MobileProductCard
          key={product.id}
          priority={index === 0}
          product={product}
        />
      ))}
    </MobileProductGridLayout>
  )
}
