import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react"
import {
  Outlet,
  getRouteApi,
  useLocation,
  useSearch,
} from "@tanstack/react-router"

import { mobileNavigationConfig } from "@/app/config/mobile-navigation.config"
import { DeferredAccountNavigationAction } from "@/features/auth/deferred-account-navigation"
import { MobileCatalog } from "@/features/catalog/components/mobile-catalog"
import { MobileCatalogSearch } from "@/features/catalog/components/mobile-catalog-search"
import type {
  CatalogSearch,
  CatalogSearchNavigationOptions,
} from "@/features/catalog/model/catalog-search"
import { MobileHero } from "@/features/home/components/mobile-hero"
import { useActiveHomeSection } from "@/features/home/hooks/use-active-home-section"
import { useMediaQuery } from "@/shared/hooks/use-media-query"

const mobileSectionHrefs = mobileNavigationConfig.items.flatMap((item) =>
  item.href.startsWith("#") ? [item.href] : [],
)

const homeRouteApi = getRouteApi("/marketplace/")
const HomeDesktop = lazy(() =>
  import("./home-desktop").then((module) => ({
    default: module.HomeDesktop,
  })),
)
const MobileBottomNavigation = lazy(() =>
  import("@/shared/components/layout/mobile-bottom-navigation").then(
    (module) => ({ default: module.MobileBottomNavigation }),
  ),
)
interface HomeMobileProps {
  returnTo: string
  search: CatalogSearch
  onSearchChange: (
    search: CatalogSearch,
    options?: CatalogSearchNavigationOptions,
  ) => void
}

function HomeMobile({ returnTo, search, onSearchChange }: HomeMobileProps) {
  const [areFiltersOpen, setAreFiltersOpen] = useState(false)
  const [canLoadNavigation, setCanLoadNavigation] = useState(false)
  const [wereFiltersOpened, setWereFiltersOpened] = useState(false)
  const filtersDialogId = useId()
  const filterButtonRef = useRef<HTMLButtonElement>(null)
  const activeSectionHref = useActiveHomeSection(mobileSectionHrefs)

  useEffect(() => {
    const timeoutId = globalThis.setTimeout(
      () => setCanLoadNavigation(true),
      300,
    )

    return () => globalThis.clearTimeout(timeoutId)
  }, [])

  function searchCatalog(query: string) {
    onSearchChange({ ...search, q: query, page: 1 })
  }

  return (
    <div className="min-h-svh bg-black text-foreground" id="inicio">
      <div className="mx-auto min-h-svh w-full max-w-3xl overflow-hidden rounded-shell bg-ink">
        <main className="flex w-full flex-col gap-section-mobile px-page-mobile pt-page-top-mobile pb-37.5">
          <MobileCatalogSearch
            filterButtonRef={filterButtonRef}
            filtersDialogId={filtersDialogId}
            filtersOpen={areFiltersOpen}
            onFilterClick={() => {
              setWereFiltersOpened(true)
              setAreFiltersOpen(true)
            }}
            onSearch={searchCatalog}
            value={search.q}
          />
          <MobileHero />
          <div id="catalogo">
            <MobileCatalog
              filterTriggerRef={filterButtonRef}
              filtersDialogId={filtersDialogId}
              filtersOpen={areFiltersOpen}
              renderFilters={wereFiltersOpened}
              onFiltersOpenChange={setAreFiltersOpen}
              onSearchChange={onSearchChange}
              search={search}
            />
          </div>
        </main>
        {canLoadNavigation ? (
          <Suspense fallback={null}>
            <MobileBottomNavigation
              {...mobileNavigationConfig}
              items={mobileNavigationConfig.items.map((item) => ({
                ...item,
                active: item.href === activeSectionHref,
              }))}
              accountAction={
                <DeferredAccountNavigationAction
                  returnTo={returnTo}
                  variant="mobile"
                />
              }
            />
          </Suspense>
        ) : null}
      </div>
    </div>
  )
}

export function HomeRoute() {
  const isDesktop = useMediaQuery("(min-width: 1280px)")
  const location = useLocation()
  const search = useSearch({ from: "/marketplace" })
  const navigate = homeRouteApi.useNavigate()
  const isAuthRoute =
    location.pathname === "/login" || location.pathname === "/register"

  const changeCatalogSearch = useCallback(
    (
      nextSearch: CatalogSearch,
      options?: CatalogSearchNavigationOptions,
    ) => {
      if (isAuthRoute) return

      void navigate({
        search: nextSearch,
        replace: options?.replace,
        resetScroll: false,
      })
    },
    [isAuthRoute, navigate],
  )

  if (!isDesktop && isAuthRoute) return <Outlet />

  return (
    <>
      {isDesktop ? (
        <Suspense fallback={null}>
          <HomeDesktop
            onSearchChange={changeCatalogSearch}
            returnTo={location.href}
            search={search}
          />
        </Suspense>
      ) : (
        <HomeMobile
          onSearchChange={changeCatalogSearch}
          returnTo={location.href}
          search={search}
        />
      )}
      <Outlet />
    </>
  )
}
