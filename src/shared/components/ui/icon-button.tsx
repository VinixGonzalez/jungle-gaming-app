import * as React from "react"

import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/utils/cn"

type IconButtonProps = Omit<
  React.ComponentPropsWithoutRef<typeof Button>,
  "aria-label" | "asChild" | "children"
> & {
  /** Required accessible name for the icon-only control. */
  label: string
  children: React.ReactNode
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    {
      label,
      children,
      type = "button",
      size = "icon",
      className,
      ...props
    },
    ref,
  ) {
    return (
      <Button
        ref={ref}
        data-slot="icon-button"
        type={type}
        size={size}
        aria-label={label}
        className={cn("shrink-0", className)}
        {...props}
      >
        {children}
      </Button>
    )
  },
)

export { IconButton }
