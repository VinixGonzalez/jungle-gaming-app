import { Pagination } from "@/shared/components/ui/pagination"

import { useCatalogController } from "../hooks/use-catalog-controller"
import type {
  CatalogSearch,
  CatalogSearchChangeHandler,
} from "../model/catalog-search"
import { CatalogErrorState } from "./catalog-error-state"
import { CatalogFilters } from "./catalog-filters"
import { CatalogToolbar } from "./catalog-toolbar"
import { DesktopCatalogLoadingState } from "./desktop-catalog-loading-state"
import { DesktopProductCard } from "./desktop-product-card"
import { FeaturedNftBanner } from "./featured-nft-banner"

const DESKTOP_PAGE_SIZE = 9

interface DesktopCatalogProps {
  search: CatalogSearch
  onSearchChange: CatalogSearchChangeHandler
}

export function DesktopCatalog({
  search,
  onSearchChange,
}: DesktopCatalogProps) {
  const {
    activeTab,
    catalog,
    catalogRegionRef,
    catalogQuery,
    changeFilters,
    changePage,
    changeSort,
    changeTab,
    filters,
    page,
    sort,
  } = useCatalogController({
    onSearchChange,
    pageSize: DESKTOP_PAGE_SIZE,
    search,
  })

  if (catalogQuery.isPending) {
    return <DesktopCatalogLoadingState />
  }

  if (!catalog) {
    return (
      <section aria-label="Mercado de NFTs" className="h-343.25 w-full">
        <CatalogErrorState onRetry={() => void catalogQuery.refetch()} />
      </section>
    )
  }

  return (
    <section
      ref={catalogRegionRef}
      aria-busy={catalogQuery.isFetching}
      aria-label="Mercado de NFTs"
      className="flex h-343.25 w-full items-start gap-12 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
      tabIndex={-1}
    >
      <div className="flex w-77.5 shrink-0 flex-col items-start gap-6">
        <CatalogFilters
          facets={catalog.facets}
          onChange={changeFilters}
          value={filters}
        />
        <FeaturedNftBanner item={catalog.featuredItem} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col items-end gap-22">
        <div className="flex w-full flex-col items-start gap-8">
          <CatalogToolbar
            activeTab={activeTab}
            onSortChange={changeSort}
            onTabChange={changeTab}
            sort={sort}
          />

          {catalog.items.length > 0 ? (
            <div className="grid w-full grid-cols-[repeat(3,258px)] gap-x-8.5 gap-y-18">
              {catalog.items.map((product, index) => (
                <DesktopProductCard
                  key={product.id}
                  priority={index === 0}
                  product={product}
                />
              ))}
            </div>
          ) : (
            <p className="py-16 text-size-16 text-text-secondary">
              Nenhum NFT encontrado para os filtros selecionados.
            </p>
          )}
        </div>

        {catalog.pagination.totalPages > 1 ? (
          <Pagination
            activeItemClassName="text-ink"
            ariaLabel="Paginação do catálogo"
            getCurrentPageLabel={(targetPage) =>
              `Página ${targetPage}, página atual`
            }
            getPageLabel={(targetPage) => `Ir para a página ${targetPage}`}
            nextLabel="Próxima página"
            onPageChange={changePage}
            page={page}
            pageCount={catalog.pagination.totalPages}
            previousLabel="Página anterior"
          />
        ) : null}
      </div>
    </section>
  )
}
