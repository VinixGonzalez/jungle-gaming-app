import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import { IconButton } from "@/shared/components/ui/icon-button"
import { cn } from "@/shared/utils/cn"

type PaginationItem =
  | { type: "page"; page: number }
  | { type: "ellipsis"; key: string }

interface PaginationProps
  extends Omit<React.ComponentPropsWithoutRef<"nav">, "onChange"> {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
  siblingCount?: number
  boundaryCount?: number
  showPrevious?: boolean
  showNext?: boolean
  ariaLabel?: string
  previousLabel?: string
  nextLabel?: string
  getPageLabel?: (page: number) => string
  getCurrentPageLabel?: (page: number) => string
  listClassName?: string
  itemClassName?: string
  activeItemClassName?: string
  navigationButtonClassName?: string
}

function createPaginationItems(
  page: number,
  pageCount: number,
  siblingCount: number,
  boundaryCount: number,
) {
  const visiblePages = new Set<number>()

  for (let index = 1; index <= boundaryCount; index += 1) {
    visiblePages.add(index)
    visiblePages.add(pageCount - index + 1)
  }

  for (let index = page - siblingCount; index <= page + siblingCount; index += 1) {
    visiblePages.add(index)
  }

  const pages = Array.from(visiblePages)
    .filter((item) => item >= 1 && item <= pageCount)
    .sort((first, second) => first - second)
  const items: PaginationItem[] = []

  pages.forEach((currentPage, index) => {
    const previousPage = pages[index - 1]

    if (previousPage !== undefined) {
      const gap = currentPage - previousPage

      if (gap === 2) {
        items.push({ type: "page", page: previousPage + 1 })
      } else if (gap > 2) {
        items.push({ type: "ellipsis", key: `ellipsis-${previousPage}` })
      }
    }

    items.push({ type: "page", page: currentPage })
  })

  return items
}

export function Pagination({
  page,
  pageCount,
  onPageChange,
  siblingCount = 1,
  boundaryCount = 1,
  showPrevious = true,
  showNext = true,
  ariaLabel = "Pagination",
  previousLabel = "Previous page",
  nextLabel = "Next page",
  getPageLabel = (targetPage) => `Go to page ${targetPage}`,
  getCurrentPageLabel = (targetPage) =>
    `Page ${targetPage}, current page`,
  listClassName,
  itemClassName,
  activeItemClassName,
  navigationButtonClassName,
  className,
  ...props
}: PaginationProps) {
  const normalizedPageCount = Math.max(0, Math.floor(pageCount))
  const safePage =
    normalizedPageCount === 0
      ? 0
      : Math.min(Math.max(Math.floor(page), 1), normalizedPageCount)
  const items = createPaginationItems(
    safePage,
    normalizedPageCount,
    Math.max(0, Math.floor(siblingCount)),
    Math.max(0, Math.floor(boundaryCount)),
  )
  const navigationClassName = cn(
    "size-8.75 rounded-sm bg-transparent text-foreground hover:border-primary hover:bg-transparent hover:text-primary focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-40",
    navigationButtonClassName,
  )

  function selectPage(nextPage: number) {
    if (
      nextPage >= 1 &&
      nextPage <= normalizedPageCount &&
      nextPage !== safePage
    ) {
      onPageChange(nextPage)
    }
  }

  return (
    <nav
      aria-label={ariaLabel}
      className={className}
      data-slot="pagination"
      {...props}
    >
      <ul className={cn("flex items-center gap-2", listClassName)}>
        {showPrevious ? (
          <li>
            <IconButton
              className={navigationClassName}
              disabled={safePage <= 1}
              label={previousLabel}
              onClick={() => selectPage(safePage - 1)}
              type="button"
              variant="outline"
            >
              <ChevronLeft aria-hidden="true" className="size-4.5" />
            </IconButton>
          </li>
        ) : null}

        {items.map((item) => {
          if (item.type === "ellipsis") {
            return (
              <li
                aria-hidden="true"
                className="flex size-8.75 items-center justify-center text-muted-foreground"
                key={item.key}
              >
                &hellip;
              </li>
            )
          }

          const isActive = item.page === safePage

          return (
            <li key={item.page}>
              <Button
                aria-current={isActive ? "page" : undefined}
                aria-label={
                  isActive
                    ? getCurrentPageLabel(item.page)
                    : getPageLabel(item.page)
                }
                className={cn(
                  "size-8.75 rounded-sm text-size-18 leading-size-16 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  !isActive &&
                    "bg-transparent text-foreground hover:border-primary hover:bg-transparent hover:text-primary",
                  isActive &&
                    cn(
                      "border-primary font-bold hover:text-primary-foreground",
                      activeItemClassName,
                    ),
                  itemClassName,
                )}
                onClick={() => selectPage(item.page)}
                size="icon"
                type="button"
                variant={isActive ? "default" : "outline"}
              >
                {item.page}
              </Button>
            </li>
          )
        })}

        {showNext ? (
          <li>
            <IconButton
              className={navigationClassName}
              disabled={
                normalizedPageCount === 0 || safePage >= normalizedPageCount
              }
              label={nextLabel}
              onClick={() => selectPage(safePage + 1)}
              type="button"
              variant="outline"
            >
              <ChevronRight aria-hidden="true" className="size-4.5" />
            </IconButton>
          </li>
        ) : null}
      </ul>
    </nav>
  )
}
