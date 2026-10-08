import { Minus, Plus } from "lucide-react"

import { IconButton } from "@/shared/components/ui/icon-button"
import { cn } from "@/shared/utils/cn"

interface QuantityStepperProps {
  value: number
  minimum?: number
  maximum: number
  onValueChange: (value: number) => void
  decrementLabel?: string
  incrementLabel?: string
  groupLabel?: string
  size?: "compact" | "comfortable"
  variant?: "primary" | "subtle"
  disabled?: boolean
  className?: string
}

export function QuantityStepper({
  value,
  minimum = 1,
  maximum,
  onValueChange,
  decrementLabel = "Diminuir quantidade",
  incrementLabel = "Aumentar quantidade",
  groupLabel = "Quantidade",
  size = "comfortable",
  variant = "primary",
  disabled = false,
  className,
}: QuantityStepperProps) {
  const isCompact = size === "compact"
  const isSubtle = variant === "subtle"
  const isDecrementDisabled = disabled || value <= minimum
  const isIncrementDisabled = disabled || value >= maximum

  return (
    <div
      aria-label={groupLabel}
      className={cn(
        "flex items-center",
        isCompact ? "gap-1" : "gap-2",
        className,
      )}
      role="group"
    >
      <IconButton
        className={cn(
          "relative rounded-full border-0 bg-transparent p-0 text-ink hover:bg-transparent disabled:opacity-100",
          isCompact ? "size-11" : "size-12.5",
        )}
        disabled={isDecrementDisabled}
        label={decrementLabel}
        onClick={() => onValueChange(Math.max(minimum, value - 1))}
        type="button"
      >
        <span
          className={cn(
            "flex items-center justify-center rounded-full border transition-colors",
            isSubtle
              ? "border-border bg-surface-raised text-text-accent group-hover/button:border-primary"
              : "border-ink bg-primary text-ink group-hover/button:bg-primary-hover",
            isDecrementDisabled &&
              "border-border bg-surface-raised text-text-muted",
            isSubtle
              ? "size-6"
              : isCompact
                ? "h-7.5 w-5"
                : "h-12.5 w-8.25",
          )}
        >
          <Minus
            aria-hidden="true"
            className={isCompact ? "size-3.5" : "size-5"}
          />
        </span>
      </IconButton>

      <output
        aria-label="Quantidade selecionada"
        className={cn(
          "min-w-3 text-center font-medium text-foreground",
          isCompact
            ? "text-size-18 leading-size-25"
            : "text-size-28 leading-size-40",
        )}
      >
        {value}
      </output>

      <IconButton
        className={cn(
          "relative rounded-full border-0 bg-transparent p-0 text-ink hover:bg-transparent disabled:opacity-100",
          isCompact ? "size-11" : "size-12.5",
        )}
        disabled={isIncrementDisabled}
        label={incrementLabel}
        onClick={() => onValueChange(Math.min(maximum, value + 1))}
        type="button"
      >
        <span
          className={cn(
            "flex items-center justify-center rounded-full border transition-colors",
            isSubtle
              ? "border-border bg-surface-raised text-text-accent group-hover/button:border-primary"
              : "border-ink bg-primary text-ink group-hover/button:bg-primary-hover",
            isIncrementDisabled &&
              "border-border bg-surface-raised text-text-muted",
            isSubtle
              ? "size-6"
              : isCompact
                ? "h-7.5 w-5"
                : "h-12.5 w-8.25",
          )}
        >
          <Plus
            aria-hidden="true"
            className={isCompact ? "size-3.5" : "size-5"}
          />
        </span>
      </IconButton>
    </div>
  )
}
