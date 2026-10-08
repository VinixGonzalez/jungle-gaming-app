import * as React from "react"

import { cn } from "@/shared/utils/cn"

interface CarouselRenderState<TItem> {
  activeIndex: number
  activeItem: TItem | undefined
  itemCount: number
  isFirst: boolean
  isLast: boolean
  goTo: (index: number) => void
  next: () => void
  previous: () => void
}

interface CarouselProps<TItem>
  extends Omit<React.ComponentPropsWithoutRef<"section">, "children"> {
  items: readonly TItem[]
  activeIndex: number
  onActiveIndexChange: (index: number) => void
  children: (state: CarouselRenderState<TItem>) => React.ReactNode
  ariaLabel: string
  orientation?: "horizontal" | "vertical"
  loop?: boolean
}

export function Carousel<TItem>({
  items,
  activeIndex,
  onActiveIndexChange,
  children,
  ariaLabel,
  orientation = "horizontal",
  loop = false,
  className,
  onKeyDown,
  tabIndex = 0,
  ...props
}: CarouselProps<TItem>) {
  const itemCount = items.length
  const lastIndex = Math.max(itemCount - 1, 0)
  const safeIndex = itemCount === 0 ? 0 : Math.min(Math.max(activeIndex, 0), lastIndex)

  const goTo = React.useCallback(
    (nextIndex: number) => {
      if (itemCount === 0) {
        return
      }

      const normalizedIndex = loop
        ? ((nextIndex % itemCount) + itemCount) % itemCount
        : Math.min(Math.max(nextIndex, 0), lastIndex)

      if (normalizedIndex !== safeIndex) {
        onActiveIndexChange(normalizedIndex)
      }
    },
    [itemCount, lastIndex, loop, onActiveIndexChange, safeIndex],
  )

  const previous = React.useCallback(() => {
    goTo(safeIndex - 1)
  }, [goTo, safeIndex])

  const next = React.useCallback(() => {
    goTo(safeIndex + 1)
  }, [goTo, safeIndex])

  function handleKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    onKeyDown?.(event)

    if (event.defaultPrevented || event.target !== event.currentTarget) {
      return
    }

    const previousKey = orientation === "horizontal" ? "ArrowLeft" : "ArrowUp"
    const nextKey = orientation === "horizontal" ? "ArrowRight" : "ArrowDown"

    if (event.key === previousKey || event.key === nextKey) {
      event.preventDefault()
      if (event.key === previousKey) {
        previous()
      } else {
        next()
      }
      return
    }

    if (event.key === "Home" || event.key === "End") {
      event.preventDefault()
      goTo(event.key === "Home" ? 0 : lastIndex)
    }
  }

  return (
    <section
      aria-label={ariaLabel}
      aria-roledescription="carousel"
      className={cn(
        "relative outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
      data-active-index={safeIndex}
      data-orientation={orientation}
      data-slot="carousel"
      onKeyDown={handleKeyDown}
      role="region"
      tabIndex={tabIndex}
      {...props}
    >
      {children({
        activeIndex: safeIndex,
        activeItem: items[safeIndex],
        itemCount,
        isFirst: safeIndex === 0,
        isLast: itemCount === 0 || safeIndex === lastIndex,
        goTo,
        next,
        previous,
      })}
    </section>
  )
}
