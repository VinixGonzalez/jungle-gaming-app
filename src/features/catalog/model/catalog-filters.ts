import type { CatalogFacets, CatalogQuery } from "../api/catalog.schemas"

export type CatalogFiltersValue = Pick<
  CatalogQuery,
  "category" | "network" | "minPriceEth" | "maxPriceEth"
>

export type CatalogFiltersProps = {
  facets: CatalogFacets
  value: CatalogFiltersValue
  onChange: (value: CatalogFiltersValue) => void
}
