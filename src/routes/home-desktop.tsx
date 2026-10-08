import { useId, useRef, useState } from "react"

import { siteFooterConfig, siteHeaderConfig } from "@/app/config"
import { DeferredAccountNavigationAction } from "@/features/auth/deferred-account-navigation"
import { useCartQuery } from "@/features/cart"
import {
  DesktopCatalog,
  DesktopCatalogSearchDialog,
  type CatalogSearch,
  type CatalogSearchChangeHandler,
} from "@/features/catalog"
import {
  DesktopBlog,
  DesktopHero,
  DesktopPromos,
  useActiveHomeSection,
} from "@/features/home"
import { SiteFooter, SiteHeader } from "@/shared/components/layout"

const desktopSectionHrefs = siteHeaderConfig.navigation.map(
  (item) => item.href,
)

interface HomeDesktopProps {
  returnTo: string
  search: CatalogSearch
  onSearchChange: CatalogSearchChangeHandler
}

export function HomeDesktop({
  returnTo,
  search,
  onSearchChange,
}: HomeDesktopProps) {
  const cartQuery = useCartQuery()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const searchDialogId = useId()
  const searchButtonRef = useRef<HTMLButtonElement>(null)
  const activeSectionHref = useActiveHomeSection(desktopSectionHrefs)
  const headerConfig = {
    ...siteHeaderConfig,
    navigation: siteHeaderConfig.navigation.map((item) => ({
      ...item,
      active: item.href === activeSectionHref,
    })),
    accountAction: (
      <DeferredAccountNavigationAction
        returnTo={returnTo}
        variant="desktop"
      />
    ),
  }

  function searchCatalog(query: string) {
    onSearchChange({ ...search, q: query, page: 1 })
  }

  return (
    <div className="min-h-svh bg-ink text-foreground" id="inicio">
      <div className="mx-auto flex w-full max-w-content flex-col gap-section-desktop py-page-top-desktop">
        <div className="flex h-131.75 w-full flex-col gap-8 overflow-hidden">
          <SiteHeader
            {...headerConfig}
            cart={{
              ...headerConfig.cart,
              count: cartQuery.data?.totals.itemCount ?? 0,
            }}
            search={{
              ...siteHeaderConfig.search,
              controls: searchDialogId,
              expanded: isSearchOpen,
              onClick: () => setIsSearchOpen(true),
            }}
            searchButtonRef={searchButtonRef}
          />
          <DesktopHero />
        </div>

        <DesktopCatalogSearchDialog
          id={searchDialogId}
          onOpenChange={setIsSearchOpen}
          onSearch={searchCatalog}
          open={isSearchOpen}
          triggerRef={searchButtonRef}
          value={search.q}
        />

        <main className="flex w-full flex-col gap-section-desktop">
          <div id="catalogo">
            <DesktopCatalog onSearchChange={onSearchChange} search={search} />
          </div>
          <DesktopPromos />
          <DesktopBlog />
        </main>

        <SiteFooter {...siteFooterConfig} />
      </div>
    </div>
  )
}
