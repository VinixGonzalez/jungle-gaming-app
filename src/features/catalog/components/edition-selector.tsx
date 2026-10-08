import { useId } from "react"

import { cn } from "@/shared/utils"

import type { NftEdition } from "../api/catalog.schemas"

interface EditionSelectorProps {
  editions: readonly NftEdition[]
  value: string
  onValueChange: (editionId: string) => void
  className?: string
}

function getEditionLabel(edition: NftEdition) {
  return `1/${edition.totalSupply}`
}

export function EditionSelector({
  editions,
  value,
  onValueChange,
  className,
}: EditionSelectorProps) {
  const name = useId()

  return (
    <fieldset className={cn("flex flex-col gap-2", className)}>
      <legend className="mb-1 text-size-15 leading-size-16 font-bold text-foreground">
        Edição:
      </legend>
      <div className="flex flex-wrap items-center gap-1.5">
        {editions.map((edition) => {
          const isUnavailable = edition.availableQuantity === 0

          return (
            <label
              className={cn(
                "relative flex min-h-11 items-center rounded-full outline-none has-focus-visible:ring-2 has-focus-visible:ring-ring has-focus-visible:ring-offset-2 has-focus-visible:ring-offset-ink",
                isUnavailable ? "cursor-not-allowed" : "cursor-pointer",
              )}
              key={edition.id}
            >
              <input
                checked={value === edition.id}
                className="peer sr-only"
                disabled={isUnavailable}
                name={name}
                onChange={() => onValueChange(edition.id)}
                type="radio"
                value={edition.id}
              />
              <span
                className={cn(
                  "flex h-7 min-w-9 items-center justify-center gap-1 rounded-full border border-border px-2 text-size-14 leading-size-16 text-text-secondary transition-colors peer-checked:border-primary peer-checked:text-text-accent",
                  isUnavailable && "opacity-60",
                )}
              >
                <span className={isUnavailable ? "line-through" : undefined}>
                  {getEditionLabel(edition)}
                </span>
                {isUnavailable ? (
                  <span className="text-size-9 font-bold">ESGOTADA</span>
                ) : null}
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
