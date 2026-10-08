import * as React from "react"
import { Search, X } from "lucide-react"

import { IconButton } from "@/shared/components/ui/icon-button"
import { cn } from "@/shared/utils/cn"

type SearchFieldProps = Omit<
  React.ComponentPropsWithoutRef<"input">,
  "children" | "size" | "type"
> & {
  label: React.ReactNode
  hideLabel?: boolean
  description?: React.ReactNode
  error?: React.ReactNode
  onClear?: () => void
  containerClassName?: string
  labelClassName?: string
  inputWrapperClassName?: string
  iconClassName?: string
  clearLabel?: string
}

const SearchField = React.forwardRef<HTMLInputElement, SearchFieldProps>(
  function SearchField(
    {
      id,
      label,
      hideLabel = true,
      description,
      error,
      onClear,
      className,
      containerClassName,
      labelClassName,
      inputWrapperClassName,
      iconClassName,
      clearLabel = "Clear search",
      value,
      defaultValue,
      disabled,
      "aria-describedby": ariaDescribedBy,
      "aria-invalid": ariaInvalid,
      ...props
    },
    forwardedRef,
  ) {
    const generatedId = React.useId()
    const inputId = id ?? `search-field-${generatedId}`
    const descriptionId = description ? `${inputId}-description` : undefined
    const errorId = error ? `${inputId}-error` : undefined
    const describedBy =
      [ariaDescribedBy, descriptionId, errorId].filter(Boolean).join(" ") ||
      undefined
    const hasValue = value != null ? String(value).length > 0 : false

    return (
      <div
        data-slot="search-field"
        data-invalid={error ? "true" : undefined}
        className={cn("grid gap-1.5", containerClassName)}
      >
        <label
          htmlFor={inputId}
          className={cn(
            "text-body-sm font-medium text-foreground",
            hideLabel && "sr-only",
            labelClassName,
          )}
        >
          {label}
        </label>

        <div
          data-slot="search-field-control"
          className={cn(
            "group/search-field flex h-10 items-center gap-2 rounded-md border border-input bg-transparent px-3 transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/30 has-aria-invalid:border-destructive has-aria-invalid:ring-destructive/20 has-disabled:cursor-not-allowed has-disabled:opacity-50",
            inputWrapperClassName,
          )}
        >
          <Search
            aria-hidden="true"
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-colors group-focus-within/search-field:text-primary",
              iconClassName,
            )}
          />

          <input
            ref={forwardedRef}
            id={inputId}
            type="search"
            value={value}
            defaultValue={defaultValue}
            disabled={disabled}
            aria-invalid={ariaInvalid ?? (error ? true : undefined)}
            aria-describedby={describedBy}
            className={cn(
              "min-w-0 flex-1 appearance-none bg-transparent text-body-sm text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed [&::-webkit-search-cancel-button]:hidden",
              className,
            )}
            {...props}
          />

          {onClear && hasValue ? (
            <IconButton
              className="size-6 rounded-sm bg-transparent text-muted-foreground hover:bg-surface-raised hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
              disabled={disabled}
              label={clearLabel}
              onClick={onClear}
              size="icon-xs"
              type="button"
              variant="ghost"
            >
              <X aria-hidden="true" className="size-3.5" />
            </IconButton>
          ) : null}
        </div>

        {description ? (
          <p
            id={descriptionId}
            data-slot="search-field-description"
            className="text-caption text-muted-foreground"
          >
            {description}
          </p>
        ) : null}

        {error ? (
          <p
            id={errorId}
            data-slot="search-field-error"
            className="text-caption text-destructive"
          >
            {error}
          </p>
        ) : null}
      </div>
    )
  },
)

export { SearchField }
