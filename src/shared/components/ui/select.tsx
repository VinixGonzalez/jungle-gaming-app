import * as React from "react"
import { ChevronDown } from "lucide-react"

import { cn } from "@/shared/utils/cn"

const Select = React.forwardRef<
  HTMLSelectElement,
  React.ComponentPropsWithoutRef<"select">
>(function Select({ className, children, ...props }, ref) {
  return (
    <span className="relative block">
      <select
        ref={ref}
        className={cn(
          "h-10 w-full appearance-none rounded-control border border-input bg-ink px-3 pr-9 text-size-14 text-foreground scheme-dark outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&>option]:bg-ink [&>option]:text-foreground",
          className,
        )}
        data-slot="select"
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-secondary"
      />
    </span>
  )
})

export { Select }
