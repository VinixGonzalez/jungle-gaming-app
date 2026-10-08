import { catalogFixtureSlugs } from "@/features/catalog/mocks/catalog-fixture-slugs"
import { mockScenarioCookieName } from "@/shared/mocks"

const catalogStorageKeys = [
  "kurio_mock_catalog_inventory_v1",
  "kurio_mock_realtime_catalog_v1",
]

export function canPrimeInitialMockCache() {
  if (window.location.search) return false

  const detailPath = window.location.pathname.match(/^\/nfts\/([^/]+)$/)
  const detailSlug = detailPath?.[1] ?? null
  const supportsInitialCache =
    window.location.pathname === "/" ||
    detailSlug === catalogFixtureSlugs.genesisCircuit

  if (!supportsInitialCache) return false
  if (catalogStorageKeys.some((key) => localStorage.getItem(key) !== null)) {
    return false
  }

  const scenarioCookie = document.cookie
    .split(";")
    .map((value) => value.trim())
    .find((value) => value.startsWith(`${mockScenarioCookieName}=`))
  const scenario = scenarioCookie
    ? decodeURIComponent(scenarioCookie.split("=").slice(1).join("="))
    : (import.meta.env.VITE_MOCK_SCENARIO ?? "default")

  return scenario === "default"
}
