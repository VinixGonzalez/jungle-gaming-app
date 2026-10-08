import { useState } from "react"

import { Button } from "@/shared/components/ui/button"
import { Slider } from "@/shared/components/ui/slider"
import { formatEth } from "@/shared/utils"

interface CatalogPriceRangeFilterProps {
  minimumPrice: number
  maximumPrice: number
  selectedMinimumPrice: number
  selectedMaximumPrice: number
  onApply: (minimumPrice: string, maximumPrice: string) => void
}

function serializeSliderValue(value: number) {
  return value.toFixed(2).replace(/\.?0+$/, "")
}

export function CatalogPriceRangeFilter({
  minimumPrice,
  maximumPrice,
  selectedMinimumPrice,
  selectedMaximumPrice,
  onApply,
}: CatalogPriceRangeFilterProps) {
  const [priceRange, setPriceRange] = useState([
    selectedMinimumPrice,
    selectedMaximumPrice,
  ])

  function applyPriceRange() {
    onApply(
      serializeSliderValue(priceRange[0] ?? minimumPrice),
      serializeSliderValue(priceRange[1] ?? maximumPrice),
    )
  }

  return (
    <section className="flex w-full flex-col items-start gap-3 overflow-hidden">
      <h2 className="text-size-18 leading-size-16 font-bold text-foreground">
        Faixa de preço
      </h2>
      <div className="flex w-full flex-col items-start gap-3 overflow-hidden pl-3">
        <Slider
          aria-label="Faixa de preço em Ether"
          className="h-5.25 w-61.5"
          getValueText={(sliderValue) =>
            formatEth(serializeSliderValue(sliderValue))
          }
          max={maximumPrice}
          min={minimumPrice}
          minStepsBetweenThumbs={1}
          onValueChange={setPriceRange}
          rangeClassName="bg-primary"
          step={0.01}
          thumbClassName="size-5.25 border-ink"
          thumbLabels={["Preço mínimo", "Preço máximo"]}
          trackClassName="h-1 bg-primary"
          value={priceRange}
        />
        <p className="text-size-15 leading-normal text-foreground">
          Preço: {formatEth(serializeSliderValue(priceRange[0] ?? minimumPrice))}
          {" – "}
          {formatEth(serializeSliderValue(priceRange[1] ?? maximumPrice))}
        </p>
        <Button
          className="h-9 rounded-md px-3 text-size-16 leading-size-20 font-bold"
          onClick={applyPriceRange}
          type="button"
        >
          Aplicar
        </Button>
      </div>
    </section>
  )
}
