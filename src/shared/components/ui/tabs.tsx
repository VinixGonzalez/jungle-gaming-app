import * as React from "react"

import { cn } from "@/shared/utils/cn"

interface TabItem<TValue extends string> {
  value: TValue
  label: React.ReactNode
  disabled?: boolean
  ariaLabel?: string
  id?: string
  panelId?: string
}

interface TabsProps<TValue extends string>
  extends Omit<React.ComponentPropsWithoutRef<"div">, "onChange"> {
  items: readonly TabItem<TValue>[]
  value: TValue
  onValueChange: (value: TValue) => void
  ariaLabel: string
  orientation?: "horizontal" | "vertical"
  activationMode?: "automatic" | "manual"
  tabClassName?: string
  activeTabClassName?: string
  inactiveTabClassName?: string
}

export function Tabs<TValue extends string>({
  items,
  value,
  onValueChange,
  ariaLabel,
  orientation = "horizontal",
  activationMode = "automatic",
  className,
  tabClassName,
  activeTabClassName,
  inactiveTabClassName,
  ...props
}: TabsProps<TValue>) {
  const generatedId = React.useId()
  const tabRefs = React.useRef<Array<HTMLButtonElement | null>>([])
  const enabledIndexes = items.flatMap((item, index) =>
    item.disabled ? [] : [index],
  )
  const selectedIndex = items.findIndex((item) => item.value === value)
  const fallbackIndex = enabledIndexes[0] ?? -1
  const tabbableIndex =
    selectedIndex >= 0 && !items[selectedIndex]?.disabled
      ? selectedIndex
      : fallbackIndex

  function focusTab(index: number) {
    const item = items[index]

    if (!item || item.disabled) {
      return
    }

    tabRefs.current[index]?.focus()

    if (activationMode === "automatic") {
      onValueChange(item.value)
    }
  }

  function moveFocus(currentIndex: number, offset: -1 | 1) {
    const position = enabledIndexes.indexOf(currentIndex)

    if (position < 0 || enabledIndexes.length === 0) {
      return
    }

    const nextPosition =
      (position + offset + enabledIndexes.length) % enabledIndexes.length
    const nextIndex = enabledIndexes[nextPosition]

    if (nextIndex !== undefined) {
      focusTab(nextIndex)
    }
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    const previousKey = orientation === "horizontal" ? "ArrowLeft" : "ArrowUp"
    const nextKey = orientation === "horizontal" ? "ArrowRight" : "ArrowDown"

    if (event.key === previousKey || event.key === nextKey) {
      event.preventDefault()
      moveFocus(index, event.key === previousKey ? -1 : 1)
      return
    }

    if (event.key === "Home" || event.key === "End") {
      event.preventDefault()
      const targetIndex =
        event.key === "Home"
          ? enabledIndexes[0]
          : enabledIndexes[enabledIndexes.length - 1]

      if (targetIndex !== undefined) {
        focusTab(targetIndex)
      }
    }
  }

  return (
    <div
      aria-label={ariaLabel}
      aria-orientation={orientation}
      className={cn(
        "flex gap-4",
        orientation === "vertical" && "flex-col",
        className,
      )}
      data-orientation={orientation}
      data-slot="tabs-list"
      role="tablist"
      {...props}
    >
      {items.map((item, index) => {
        const isActive = item.value === value

        return (
          <button
            aria-controls={item.panelId}
            aria-label={item.ariaLabel}
            aria-selected={isActive}
            className={cn(
              "relative shrink-0 cursor-pointer border-0 bg-transparent px-0 py-1 text-foreground transition-colors outline-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-left after:scale-x-0 after:bg-primary after:transition-transform hover:text-text-accent focus-visible:rounded-xs focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
              isActive
                ? cn(
                    "font-bold text-text-accent after:scale-x-100",
                    activeTabClassName,
                  )
                : inactiveTabClassName,
              tabClassName,
            )}
            data-state={isActive ? "active" : "inactive"}
            disabled={item.disabled}
            id={item.id ?? `${generatedId}-tab-${index}`}
            key={item.value}
            onClick={() => onValueChange(item.value)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            ref={(node) => {
              tabRefs.current[index] = node
            }}
            role="tab"
            tabIndex={index === tabbableIndex ? 0 : -1}
            type="button"
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
