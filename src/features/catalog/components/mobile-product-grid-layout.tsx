import type { PropsWithChildren } from "react"

export function MobileProductGridLayout({ children }: PropsWithChildren) {
  return (
    <div className="grid w-full grid-cols-2 items-start gap-x-4 gap-y-6 pb-8 md:grid-cols-3">
      {children}
    </div>
  )
}
