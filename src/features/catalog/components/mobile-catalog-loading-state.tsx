import { Skeleton } from "@/shared/components/ui/skeleton"

import { MobileProductGridLayout } from "./mobile-product-grid-layout"

interface MobileCatalogLoadingStateProps {
  itemCount: number
}

export function MobileCatalogLoadingState({
  itemCount,
}: MobileCatalogLoadingStateProps) {
  return (
    <section
      aria-busy="true"
      aria-label="Carregando mercado de NFTs"
      className="flex w-full flex-col gap-4"
    >
      <Skeleton className="h-5.5 w-full" />
      <MobileProductGridLayout>
        {Array.from({ length: itemCount }, (_, index) => (
          <div className="flex min-w-0 flex-col gap-2" key={index}>
            <Skeleton className="aspect-175/200 w-full rounded-4xl" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-3.5 w-2/5" />
          </div>
        ))}
      </MobileProductGridLayout>
      <span className="sr-only">Carregando catálogo</span>
    </section>
  )
}
