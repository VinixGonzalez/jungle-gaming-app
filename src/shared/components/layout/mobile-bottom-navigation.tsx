import type { CSSProperties, ReactNode } from "react"
import { ScanLine } from "lucide-react"

import { IconButton } from "@/shared/components/ui/icon-button"
import { cn } from "@/shared/utils/cn"

type MobileNavigationItem = {
  label: string
  href: string
  iconSrc: string
  active?: boolean
}

type MobileNavigationScanAction = {
  label: string
  onClick?: () => void
}

type MobileBottomNavigationProps = {
  items: readonly MobileNavigationItem[]
  scanAction: MobileNavigationScanAction
  accountAction: ReactNode
  className?: string
}

const navigationItemPositions = [
  "left-[11.111%]",
  "left-[28.502%]",
  "left-[72.947%]",
] as const

const navigationSurfaceStyle: CSSProperties = {
  clipPath:
    'path("M282.85 0 C269.09 0 256.87 8.2 251.02 20.65 C243.26 37.17 226.46 48.62 207 48.62 C187.54 48.62 170.74 37.18 162.98 20.65 C157.13 8.2 144.9 0 131.15 0 H28.93 C12.95 0 0 12.95 0 28.93 V94.95 H414 V28.93 C414 12.95 401.05 0 385.07 0 H282.85 Z")',
  filter: "drop-shadow(0 -10px 15px rgb(10 6 4 / 45%))",
}

function MobileBottomNavigation({
  items,
  scanAction,
  accountAction,
  className,
}: MobileBottomNavigationProps) {
  return (
    <nav
      className={cn(
        "fixed bottom-0 left-1/2 z-50 h-31.5 w-full max-w-103.5 -translate-x-1/2 overflow-hidden md:max-w-3xl xl:hidden",
        className,
      )}
      aria-label="Navegação principal"
    >
      <span
        className="pointer-events-none absolute left-1/2 top-7.75 h-23.75 w-103.5 -translate-x-1/2 bg-surface-card md:hidden"
        aria-hidden="true"
        style={navigationSurfaceStyle}
      />

      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-7.75 hidden h-23.75 rounded-t-[40px] bg-surface-card shadow-[0_-10px_15px_rgb(10_6_4/45%)] md:block"
      />

      {items.map((item, index) => (
        <a
          className={cn(
            "absolute top-14.75 z-10 grid size-11 -translate-x-1/2 place-items-center rounded-full outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring",
            navigationItemPositions[index] ?? "hidden",
          )}
          href={item.href}
          aria-label={item.label}
          aria-current={item.active ? "page" : undefined}
          key={item.href}
        >
          <img
            className={cn(
              "max-h-5 max-w-5",
              !item.active && "opacity-90",
            )}
            src={item.iconSrc}
            alt=""
          />
        </a>
      ))}

      <div className="absolute left-[87.923%] top-14.75 z-10 size-11 -translate-x-1/2">
        {accountAction}
      </div>

      <IconButton
        className="absolute left-[calc(50%+0.5px)] top-0 z-20 grid size-16.25 -translate-x-1/2 place-items-center rounded-full bg-[linear-gradient(180deg,rgba(210,138,76,0.4)_-16.923%,#d28a4c_109.231%)] text-ink shadow-[0_8px_20px_rgb(10_6_4/35%)] transition-transform hover:scale-103 hover:bg-[linear-gradient(180deg,rgba(210,138,76,0.4)_-16.923%,#d28a4c_109.231%)] focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-95 disabled:opacity-100 disabled:hover:scale-100 disabled:active:scale-100"
        disabled={!scanAction.onClick}
        label={scanAction.label}
        onClick={scanAction.onClick}
        type="button"
        variant="ghost"
      >
        <ScanLine className="h-6 w-6.75 stroke-[1.8]" aria-hidden="true" />
      </IconButton>
    </nav>
  )
}

export { MobileBottomNavigation }
