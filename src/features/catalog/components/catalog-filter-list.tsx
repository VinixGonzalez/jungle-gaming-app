import { Button } from "@/shared/components/ui/button"

interface FilterOption<TValue extends string> {
  value: TValue
  label: string
  count: number
}

interface CatalogFilterListProps<TValue extends string> {
  options: ReadonlyArray<FilterOption<TValue>>
  selectedValue?: TValue
  onSelect: (value: TValue) => void
}

export function CatalogFilterList<TValue extends string>({
  options,
  selectedValue,
  onSelect,
}: CatalogFilterListProps<TValue>) {
  return (
    <div className="flex w-full flex-col overflow-hidden px-3">
      {options.map((option) => {
        const isSelected = selectedValue === option.value

        return (
          <Button
            aria-pressed={isSelected}
            className="h-10 w-full justify-between rounded-none bg-transparent p-0 text-size-15 leading-size-40 font-normal text-text-secondary hover:bg-transparent hover:text-foreground aria-pressed:text-text-accent"
            key={option.value}
            onClick={() => onSelect(option.value)}
            variant="ghost"
            type="button"
          >
            <span>{option.label}</span>
            <span className="font-bold">({option.count})</span>
          </Button>
        )
      })}
    </div>
  )
}
