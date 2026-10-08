import type { CatalogFiltersProps } from "../model/catalog-filters"
import { CatalogFilterControls } from "./catalog-filter-controls"

export function CatalogFilters(props: CatalogFiltersProps) {
  return (
    <aside
      aria-label="Filtros do catálogo"
      className="flex h-196.25 w-77.5 flex-col items-start overflow-hidden bg-surface-card p-5"
    >
      <CatalogFilterControls {...props} />
    </aside>
  )
}
