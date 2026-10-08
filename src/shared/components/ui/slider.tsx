import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/shared/utils/cn"

type SliderProps = Omit<
  React.ComponentProps<typeof SliderPrimitive.Root>,
  "children"
> & {
  /** Accessible name for each thumb, in value order. */
  thumbLabels?: readonly string[]
  /** Optional formatter announced by assistive technologies for each value. */
  getValueText?: (value: number, index: number) => string
  trackClassName?: string
  rangeClassName?: string
  thumbClassName?: string
}

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  orientation = "horizontal",
  thumbLabels,
  getValueText,
  trackClassName,
  rangeClassName,
  thumbClassName,
  ...props
}: SliderProps) {
  const values = value ?? defaultValue ?? [min]
  const isRange = values.length > 1

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      orientation={orientation}
      min={min}
      max={max}
      defaultValue={defaultValue}
      value={value}
      className={cn(
        "relative flex touch-none items-center select-none data-disabled:cursor-not-allowed data-disabled:opacity-50 data-[orientation=horizontal]:h-5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-32 data-[orientation=vertical]:w-5 data-[orientation=vertical]:flex-col",
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={cn(
          "relative grow overflow-hidden rounded-full bg-primary/25 data-[orientation=horizontal]:h-0.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-0.5",
          trackClassName,
        )}
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={cn(
            "absolute rounded-full bg-primary data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full",
            rangeClassName,
          )}
        />
      </SliderPrimitive.Track>

      {values.map((currentValue, index) => (
        <SliderPrimitive.Thumb
          key={index}
          data-slot="slider-thumb"
          aria-label={
            thumbLabels?.[index] ??
            (isRange
              ? index === 0
                ? "Minimum value"
                : index === values.length - 1
                  ? "Maximum value"
                  : `Value ${index + 1}`
              : "Value")
          }
          aria-valuetext={getValueText?.(currentValue, index)}
          className={cn(
            "block size-4 shrink-0 rounded-full border-3 border-ink bg-primary shadow-sm outline-none transition-[color,box-shadow,transform] hover:scale-110 focus-visible:ring-3 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50",
            thumbClassName,
          )}
        />
      ))}
    </SliderPrimitive.Root>
  )
}

export { Slider }
