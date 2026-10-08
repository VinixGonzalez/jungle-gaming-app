import type { ComponentProps } from "react"

import { cn } from "@/shared/utils/cn"

type BrandWordmarkProps = Omit<ComponentProps<"a">, "children"> & {
  name: string
}

function BrandWordmark({ name, className, ...props }: BrandWordmarkProps) {
  return (
    <a
      data-slot="brand-wordmark"
      className={cn(
        "inline-flex items-center text-size-14 font-bold leading-normal tracking-widest text-foreground outline-none transition-colors hover:text-primary focus-visible:text-primary",
        className,
      )}
      {...props}
    >
      {name}
    </a>
  )
}

export { BrandWordmark }
