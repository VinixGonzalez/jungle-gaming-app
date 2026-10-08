import * as React from "react"

import { IconButton } from "@/shared/components/ui/icon-button"
import { cn } from "@/shared/utils/cn"

interface CarouselIndicatorsProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "onChange"> {
  count: number
  activeIndex: number
  onActiveIndexChange: (index: number) => void
  ariaLabel?: string
  getItemLabel?: (index: number) => string
  indicatorClassName?: string
  activeIndicatorClassName?: string
  dotClassName?: string
  activeDotClassName?: string
  controlsId?: string
}

export function CarouselIndicators({
  count,
  activeIndex,
  onActiveIndexChange,
  ariaLabel = "Choose a slide",
  getItemLabel = (index) => `Go to slide ${index + 1}`,
  indicatorClassName,
  activeIndicatorClassName,
  dotClassName,
  activeDotClassName,
  controlsId,
  className,
  ...props
}: CarouselIndicatorsProps) {
  const itemCount = Math.max(0, Math.floor(count))

  if (itemCount === 0) {
    return null
  }

  return (
    <div
      aria-label={ariaLabel}
      className={cn("flex items-center gap-2", className)}
      data-slot="carousel-indicators"
      role="group"
      {...props}
    >
      {Array.from({ length: itemCount }, (_, index) => {
        const isActive = index === activeIndex

        return (
          <IconButton
            aria-controls={controlsId}
            aria-current={isActive ? "true" : undefined}
            label={getItemLabel(index)}
            className={cn(
              "group grid size-6 place-items-center rounded-full bg-transparent p-0 hover:bg-transparent focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              isActive && activeIndicatorClassName,
              indicatorClassName,
            )}
            data-state={isActive ? "active" : "inactive"}
            key={index}
            onClick={() => onActiveIndexChange(index)}
            size="icon-xs"
            type="button"
            variant="ghost"
          >
            <span
              aria-hidden="true"
              className={cn(
                "size-2 rounded-full bg-muted-foreground transition-colors group-hover:bg-foreground",
                dotClassName,
                isActive && cn("bg-primary", activeDotClassName),
              )}
            />
          </IconButton>
        )
      })}
    </div>
  )
}
