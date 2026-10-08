import { ChevronDown } from "lucide-react"

import { Button } from "@/shared/components/ui/button"

import type { CatalogSort, CatalogTab } from "../api/catalog.schemas"
import { catalogOptions } from "../config/catalog-options"
import { CatalogTabs } from "./catalog-tabs"

interface CatalogToolbarProps {
  activeTab: CatalogTab
  sort: CatalogSort
  onTabChange: (tab: CatalogTab) => void
  onSortChange: (sort: CatalogSort) => void
}

export function CatalogToolbar({
  activeTab,
  sort,
  onTabChange,
  onSortChange,
}: CatalogToolbarProps) {
  const sortIndex = catalogOptions.sortOptions.findIndex(
    (option) => option.value === sort,
  )
  const selectedSort =
    catalogOptions.sortOptions[sortIndex] ?? catalogOptions.sortOptions[0]

  function selectNextSort() {
    const nextIndex = (sortIndex + 1) % catalogOptions.sortOptions.length
    const nextSort = catalogOptions.sortOptions[nextIndex]

    if (nextSort) onSortChange(nextSort.value)
  }

  return (
    <div className="flex h-4.5 w-full shrink-0 items-center justify-between">
      <CatalogTabs
        activeTab={activeTab}
        onTabChange={onTabChange}
        variant="desktop"
      />
      <Button
        aria-label={`Ordenar por ${selectedSort.label}. Clique para alterar.`}
        className="relative h-4.5 w-75 justify-start rounded-xs bg-transparent p-0 text-left text-size-15 leading-normal font-normal text-foreground hover:bg-transparent hover:text-foreground"
        onClick={selectNextSort}
        type="button"
        variant="ghost"
      >
        <span className="absolute top-0 left-0">Ordenar por:</span>
        <span className="absolute top-0 left-27.5">{selectedSort.label}</span>
        <span className="absolute top-0.5 left-69.5 flex size-4 items-center justify-center">
          <ChevronDown aria-hidden="true" className="size-5" strokeWidth={1.5} />
        </span>
      </Button>
    </div>
  )
}
