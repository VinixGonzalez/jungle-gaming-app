import { lazy, Suspense, type RefObject } from "react"

import { Pagination } from "@/shared/components/ui/pagination"
import { useMediaQuery } from "@/shared/hooks"

import { useCatalogController } from "../hooks/use-catalog-controller"
import type {
  CatalogSearch,
  CatalogSearchChangeHandler,
} from "../model/catalog-search"
import { CatalogErrorState } from "./catalog-error-state"
import { CatalogTabs } from "./catalog-tabs"
import { MobileCatalogLoadingState } from "./mobile-catalog-loading-state"
import { MobileProductGrid } from "./mobile-product-grid"

const MobileCatalogFilters = lazy(() =>
  import("./mobile-catalog-filters").then((module) => ({
    default: module.MobileCatalogFilters,
  })),
)
interface MobileCatalogProps {
  filtersDialogId: string
  filtersOpen: boolean
  renderFilters: boolean
  filterTriggerRef: RefObject<HTMLButtonElement | null>
  search: CatalogSearch
  onFiltersOpenChange: (open: boolean) => void
  onSearchChange: CatalogSearchChangeHandler
}

export function MobileCatalog({
  filtersDialogId,
  filtersOpen,
  renderFilters,
  filterTriggerRef,
  search,
  onFiltersOpenChange,
  onSearchChange,
}: MobileCatalogProps) {
  const isTablet = useMediaQuery("(min-width: 768px)")
  const pageSize = isTablet ? 6 : 4
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
    pageSize,
    search,
  })

  if (catalogQuery.isPending) {
    return <MobileCatalogLoadingState itemCount={pageSize} />
  }

  if (!catalog) {
    return <CatalogErrorState onRetry={() => void catalogQuery.refetch()} />
  }

  return (
    <>
      <section
        ref={catalogRegionRef}
        aria-busy={catalogQuery.isFetching}
        aria-label="Mercado de NFTs"
        className="flex w-full flex-col items-start gap-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        tabIndex={-1}
      >
        <h2 className="sr-only">Mercado de NFTs</h2>
        <div className="flex w-full flex-col items-start overflow-x-auto overflow-y-hidden pb-1">
          <CatalogTabs
            activeTab={activeTab}
            onTabChange={changeTab}
            variant="mobile"
          />
        </div>

        {catalog.items.length > 0 ? (
          <>
            <MobileProductGrid products={catalog.items} />
            {catalog.pagination.totalPages > 1 ? (
              <Pagination
                activeItemClassName="text-ink"
                ariaLabel="Paginação do catálogo"
                className="flex w-full justify-center pb-8"
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
          </>
        ) : (
          <p className="py-8 text-size-14 text-text-secondary">
            Nenhum NFT encontrado.
          </p>
        )}
      </section>

      {renderFilters ? (
        <Suspense fallback={null}>
          <MobileCatalogFilters
            facets={catalog.facets}
            filters={filters}
            id={filtersDialogId}
            onFiltersChange={changeFilters}
            onOpenChange={onFiltersOpenChange}
            onSortChange={changeSort}
            open={filtersOpen}
            sort={sort}
            triggerRef={filterTriggerRef}
          />
        </Suspense>
      ) : null}
    </>
  )
}
