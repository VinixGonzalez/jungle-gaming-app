import { QuantityStepper } from "@/shared/components/ui/quantity-stepper"
import { formatEth, formatWeiToEth, parseEthToWei } from "@/shared/utils"
import { cn } from "@/shared/utils"

import type { NftEdition } from "../api/catalog.schemas"

interface QuantityAndPriceProps {
  edition: NftEdition
  quantity: number
  onQuantityChange: (quantity: number) => void
  compact?: boolean
  showPrice?: boolean
  className?: string
}

export function QuantityAndPrice({
  edition,
  quantity,
  onQuantityChange,
  compact = false,
  showPrice = true,
  className,
}: QuantityAndPriceProps) {
  if (edition.availableQuantity === 0) {
    return (
      <p
        className={cn(
          "text-size-15 leading-size-16 font-bold text-text-accent",
          className,
        )}
      >
        Edição esgotada
      </p>
    )
  }

  const totalPrice = formatWeiToEth(
    parseEthToWei(edition.priceEth) * BigInt(quantity),
  )

  return (
    <div
      className={cn(
        "flex items-center justify-between",
        compact ? "w-full" : "gap-8",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-size-15 leading-size-16 font-medium text-text-secondary">
          Qtd.
        </span>
        <QuantityStepper
          maximum={edition.availableQuantity}
          onValueChange={onQuantityChange}
          size={compact ? "compact" : "comfortable"}
          value={quantity}
        />
      </div>
      {showPrice ? (
        <p
          aria-label={`Preço total: ${formatEth(totalPrice)}`}
          className={cn(
            "font-bold whitespace-nowrap text-text-accent",
            compact
              ? "text-size-20 leading-size-16"
              : "text-size-22 leading-size-16",
          )}
        >
          {formatEth(totalPrice)}
        </p>
      ) : null}
    </div>
  )
}
