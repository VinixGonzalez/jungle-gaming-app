import type { RefObject } from "react"

import { Button } from "@/shared/components/ui/button"
import { Dialog } from "@/shared/components/ui/dialog"
import { cn } from "@/shared/utils"

import type {
  CatalogFacets,
  CatalogSort,
} from "../api/catalog.schemas"
import { catalogOptions } from "../config/catalog-options"
import type { CatalogFiltersValue } from "../model/catalog-filters"
import { CatalogFilterControls } from "./catalog-filter-controls"

interface MobileCatalogFiltersProps {
  facets: CatalogFacets
  filters: CatalogFiltersValue
  id: string
  open: boolean
  sort: CatalogSort
  triggerRef: RefObject<HTMLButtonElement | null>
  onFiltersChange: (filters: CatalogFiltersValue) => void
  onOpenChange: (open: boolean) => void
  onSortChange: (sort: CatalogSort) => void
}

export function MobileCatalogFilters({
  facets,
  filters,
  id,
  open,
  sort,
  triggerRef,
  onFiltersChange,
  onOpenChange,
  onSortChange,
}: MobileCatalogFiltersProps) {
  const hasActiveFilters = Boolean(
    filters.category ||
      filters.network ||
      filters.minPriceEth ||
      filters.maxPriceEth,
  )

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <Dialog.Content
        className="flex flex-col overflow-hidden"
        id={id}
        onCloseAutoFocus={(event) => {
          event.preventDefault()
          triggerRef.current?.focus()
        }}
        variant="drawer"
      >
        <span
          aria-hidden="true"
          className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-border-soft"
        />

        <Dialog.Header className="shrink-0 px-5 pt-3 pr-16 pb-5">
          <Dialog.Title>Filtros e ordenação</Dialog.Title>
          <Dialog.Description>
            Refine os itens exibidos no catálogo.
          </Dialog.Description>
        </Dialog.Header>

        <div className="min-h-0 flex-1 overflow-y-auto border-y border-border-soft px-5 py-6">
          <fieldset className="mb-10 flex w-full flex-col gap-4">
            <legend className="mb-3 text-size-18 leading-size-16 font-bold text-foreground">
              Ordenar por
            </legend>
            <div aria-label="Ordenação" className="grid gap-2" role="radiogroup">
              {catalogOptions.sortOptions.map((option) => (
                <label
                  className={cn(
                    "flex min-h-11 cursor-pointer items-center justify-between rounded-xl border px-4 py-2 text-size-14 transition-colors focus-within:ring-2 focus-within:ring-ring/50",
                    sort === option.value
                      ? "border-primary bg-primary/10 text-text-accent"
                      : "border-border-soft bg-ink text-foreground hover:border-primary/60",
                  )}
                  key={option.value}
                >
                  <span>{option.label}</span>
                  <input
                    checked={sort === option.value}
                    className="size-4 accent-primary"
                    name="catalog-sort"
                    onChange={() => onSortChange(option.value)}
                    type="radio"
                    value={option.value}
                  />
                </label>
              ))}
            </div>
          </fieldset>

          <CatalogFilterControls
            facets={facets}
            onChange={onFiltersChange}
            value={filters}
          />
        </div>

        <Dialog.Footer className="shrink-0 justify-between px-5 py-4">
          <Button
            className="h-10 px-3"
            disabled={!hasActiveFilters}
            onClick={() =>
              onFiltersChange({
                category: undefined,
                network: undefined,
                minPriceEth: undefined,
                maxPriceEth: undefined,
              })
            }
            type="button"
            variant="ghost"
          >
            Limpar filtros
          </Button>
          <Button
            className="h-10 px-5"
            onClick={() => onOpenChange(false)}
            type="button"
          >
            Ver resultados
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  )
}
