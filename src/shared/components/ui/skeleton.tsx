import type { ComponentPropsWithoutRef } from "react"

import { cn } from "@/shared/utils/cn"

type SkeletonProps = Omit<ComponentPropsWithoutRef<"div">, "children">

export function Skeleton({
  className,
  ...props
}: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative overflow-hidden rounded-md bg-surface-raised",
        className,
      )}
      data-slot="skeleton"
      {...props}
    >
      <span
        className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-foreground/10 to-transparent motion-safe:animate-skeleton-shimmer motion-safe:will-change-transform motion-reduce:hidden"
        data-slot="skeleton-shimmer"
      />
    </div>
  )
}
