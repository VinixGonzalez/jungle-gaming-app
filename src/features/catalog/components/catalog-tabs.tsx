import { Tabs } from "@/shared/components/ui/tabs"
import { cn } from "@/shared/utils"

import type { CatalogTab } from "../api/catalog.schemas"
import { catalogOptions } from "../config/catalog-options"

interface CatalogTabsProps {
  activeTab: CatalogTab
  onTabChange: (tab: CatalogTab) => void
  variant: "desktop" | "mobile"
  className?: string
}

const tabItems = catalogOptions.tabs.map((tab) => ({
  value: tab.value,
  label: tab.label,
}))

export function CatalogTabs({
  activeTab,
  onTabChange,
  variant,
  className,
}: CatalogTabsProps) {
  const isDesktop = variant === "desktop"

  return (
    <Tabs
      activeTabClassName="text-text-accent"
      ariaLabel="Categorias do catálogo"
      className={cn(
        "items-start whitespace-nowrap",
        isDesktop ? "gap-5" : "h-5 min-w-max gap-2 md:gap-4",
        className,
      )}
      inactiveTabClassName="font-normal text-foreground hover:text-text-accent"
      items={tabItems}
      onValueChange={onTabChange}
      tabClassName={cn(
        "py-0 text-left focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary",
        isDesktop
          ? "h-6.25 text-size-15 leading-size-16 font-medium"
          : "h-5.5 text-[clamp(0.75rem,3.1vw,0.875rem)] leading-size-16",
      )}
      value={activeTab}
    />
  )
}
