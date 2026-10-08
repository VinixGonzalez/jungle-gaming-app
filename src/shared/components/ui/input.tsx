import * as React from "react"

import { cn } from "@/shared/utils/cn"

const Input = React.forwardRef<
  HTMLInputElement,
  React.ComponentPropsWithoutRef<"input">
>(function Input({ className, type, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        "h-10 w-full min-w-0 rounded-md border border-input bg-transparent px-3 text-size-14 text-foreground outline-none transition-colors placeholder:text-secondary focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
        className,
      )}
      data-slot="input"
      type={type}
      {...props}
    />
  )
})

export { Input }
