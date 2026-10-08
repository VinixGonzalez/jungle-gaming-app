import { parseEthToWei } from "@/shared/utils"
import { cn } from "@/shared/utils"

import type { NftCategory, NftNetwork } from "../api/catalog.schemas"
import { catalogOptions } from "../config/catalog-options"
import type { CatalogFiltersProps } from "../model/catalog-filters"
import { CatalogFilterList } from "./catalog-filter-list"
import { CatalogPriceRangeFilter } from "./catalog-price-range-filter"

interface CatalogFilterControlsProps extends CatalogFiltersProps {
  className?: string
}

function clampEthAmountToRange(
  value: string,
  minimumValue: string,
  maximumValue: string,
) {
  const amount = parseEthToWei(value)

  if (amount < parseEthToWei(minimumValue)) return minimumValue
  if (amount > parseEthToWei(maximumValue)) return maximumValue

  return value
}

export function CatalogFilterControls({
  facets,
  value,
  onChange,
  className,
}: CatalogFilterControlsProps) {
  const minimumPriceEth = facets.priceRange?.minEth ?? "0"
  const maximumPriceEth = facets.priceRange?.maxEth ?? "0"
  const minimumPrice = Number(minimumPriceEth)
  const maximumPrice = Number(maximumPriceEth)
  const selectedMinimumPrice = Number(
    clampEthAmountToRange(
      value.minPriceEth ?? minimumPriceEth,
      minimumPriceEth,
      maximumPriceEth,
    ),
  )
  const selectedMaximumPrice = Number(
    clampEthAmountToRange(
      value.maxPriceEth ?? maximumPriceEth,
      minimumPriceEth,
      maximumPriceEth,
    ),
  )
  const categoryOptions = facets.categories.map((facet) => ({
    ...facet,
    label: catalogOptions.categoryLabels[facet.value],
  }))
  const networkOptions = facets.networks.map((facet) => ({
    ...facet,
    label: catalogOptions.networkLabels[facet.value],
  }))

  function toggleCategory(category: NftCategory) {
    onChange({
      ...value,
      category: value.category === category ? undefined : category,
    })
  }

  function toggleNetwork(network: NftNetwork) {
    onChange({
      ...value,
      network: value.network === network ? undefined : network,
    })
  }

  function applyPriceRange(minPriceEth: string, maxPriceEth: string) {
    onChange({
      ...value,
      minPriceEth:
        minPriceEth === facets.priceRange?.minEth ? undefined : minPriceEth,
      maxPriceEth:
        maxPriceEth === facets.priceRange?.maxEth ? undefined : maxPriceEth,
    })
  }

  return (
    <div
      className={cn("flex w-full flex-col items-start gap-10", className)}
    >
      <section className="flex w-full flex-col items-start gap-3 overflow-hidden">
        <h2 className="text-size-18 leading-size-16 font-bold text-foreground">
          Categorias
        </h2>
        <CatalogFilterList
          onSelect={toggleCategory}
          options={categoryOptions}
          selectedValue={value.category}
        />
      </section>

      {facets.priceRange ? (
        <CatalogPriceRangeFilter
          key={[
            minimumPrice,
            maximumPrice,
            selectedMinimumPrice,
            selectedMaximumPrice,
          ].join(":")}
          maximumPrice={maximumPrice}
          minimumPrice={minimumPrice}
          onApply={applyPriceRange}
          selectedMaximumPrice={selectedMaximumPrice}
          selectedMinimumPrice={selectedMinimumPrice}
        />
      ) : null}

      <section className="flex w-full flex-col items-start gap-3 overflow-hidden">
        <h2 className="text-size-18 leading-size-16 font-bold text-foreground">
          Rede
        </h2>
        <CatalogFilterList
          onSelect={toggleNetwork}
          options={networkOptions}
          selectedValue={value.network}
        />
      </section>
    </div>
  )
}
