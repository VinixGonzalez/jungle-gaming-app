import { useEffect, useRef } from "react"

import type { CatalogSort, CatalogTab } from "../api/catalog.schemas"
import type { CatalogFiltersValue } from "../model/catalog-filters"
import type {
  CatalogSearch,
  CatalogSearchChangeHandler,
} from "../model/catalog-search"
import { useCatalogQuery } from "./use-catalog-query"

interface UseCatalogControllerOptions {
  search: CatalogSearch
  onSearchChange: CatalogSearchChangeHandler
  pageSize: number
}

export function useCatalogController({
  search,
  onSearchChange,
  pageSize,
}: UseCatalogControllerOptions) {
  const catalogRegionRef = useRef<HTMLElement>(null)
  const pageAwaitingFocusRef = useRef<number | null>(null)
  const activeTab = search.tab
  const sort = search.sort
  const page = search.page
  const filters: CatalogFiltersValue = {
    category: search.category,
    network: search.network,
    minPriceEth: search.minPriceEth,
    maxPriceEth: search.maxPriceEth,
  }
  const catalogQuery = useCatalogQuery({
    ...search,
    pageSize,
  })
  const catalog = catalogQuery.data

  useEffect(() => {
    if (!catalog || catalogQuery.isPlaceholderData) return

    const lastAvailablePage = Math.max(1, catalog.pagination.totalPages)

    if (page > lastAvailablePage) {
      onSearchChange(
        {
          ...search,
          page: lastAvailablePage,
        },
        { replace: true },
      )
    }
  }, [catalog, catalogQuery.isPlaceholderData, onSearchChange, page, search])

  useEffect(() => {
    if (
      pageAwaitingFocusRef.current !== page ||
      catalogQuery.isPlaceholderData ||
      !catalog
    ) {
      return
    }

    pageAwaitingFocusRef.current = null
    catalogRegionRef.current?.scrollIntoView({
      behavior: "instant",
      block: "start",
    })
    catalogRegionRef.current?.focus({ preventScroll: true })
  }, [catalog, catalogQuery.isPlaceholderData, page])

  function changeTab(tab: CatalogTab) {
    onSearchChange({
      ...search,
      tab,
      page: 1,
    })
  }

  function changeSort(nextSort: CatalogSort) {
    onSearchChange({
      ...search,
      sort: nextSort,
      page: 1,
    })
  }

  function changeFilters(nextFilters: CatalogFiltersValue) {
    onSearchChange({
      ...search,
      ...nextFilters,
      page: 1,
    })
  }

  function changePage(nextPage: number) {
    pageAwaitingFocusRef.current = nextPage
    onSearchChange({
      ...search,
      page: nextPage,
    })
  }

  return {
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
  }
}
