import { queryClient } from "@/app/providers/query-client"
import { getInitialCatalogPageSize } from "@/app/router/get-initial-catalog-page-size"
import { authStorageKey } from "@/features/auth/mocks/auth-storage-key"
import { authSessionQueryKey } from "@/features/auth/query/auth-session-query-key"
import { catalogInitialCacheFixture } from "@/features/catalog/mocks/catalog-initial-cache.fixture"
import { catalogSearchDefaults } from "@/features/catalog/model/catalog-search-defaults"
import { catalogQueryCache } from "@/features/catalog/query/catalog-query-cache"
import { canPrimeInitialMockCache } from "./can-prime-initial-mock-cache"

let wasPrimed = false

function primeAnonymousSession() {
  try {
    const serializedState = localStorage.getItem(authStorageKey)

    if (serializedState === null) {
      queryClient.setQueryData(authSessionQueryKey, null)
      return
    }

    const state = JSON.parse(serializedState) as { session?: unknown }

    if (state.session === null) {
      queryClient.setQueryData(authSessionQueryKey, null)
    }
  } catch {
    // Invalid persisted data is validated and repaired by the mock API.
  }
}

export function primeInitialQueryCache() {
  if (wasPrimed || !canPrimeInitialMockCache()) return

  wasPrimed = true
  primeAnonymousSession()

  if (window.location.pathname === "/") {
    const query = {
      ...catalogSearchDefaults,
      pageSize: getInitialCatalogPageSize(),
    }

    queryClient.setQueryData(
      catalogQueryCache.list(query),
      catalogInitialCacheFixture.getCatalog(query.pageSize),
    )
    return
  }

  const detailPath = window.location.pathname.match(/^\/nfts\/([^/]+)$/)

  if (!detailPath) return

  const slug = decodeURIComponent(detailPath[1])
  const detail = catalogInitialCacheFixture.findDetail(slug)

  if (detail) queryClient.setQueryData(catalogQueryCache.detail(slug), detail)
}
