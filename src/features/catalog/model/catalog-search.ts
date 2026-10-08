import { isEthAmount, parseEthToWei } from "@/shared/utils"

import type {
  CatalogSort,
  CatalogTab,
  NftCategory,
  NftNetwork,
} from "../api/catalog.schemas"
import { catalogValues } from "../config/catalog-values"
import { catalogFieldLimits } from "../config/catalog-field-limits"
import { catalogSearchDefaults } from "./catalog-search-defaults"

export interface CatalogSearch {
  q: string
  tab: CatalogTab
  category?: NftCategory
  network?: NftNetwork
  minPriceEth?: string
  maxPriceEth?: string
  sort: CatalogSort
  page: number
}

export interface CatalogSearchNavigationOptions {
  replace?: boolean
}

export type CatalogSearchChangeHandler = (
  search: CatalogSearch,
  options?: CatalogSearchNavigationOptions,
) => void

function readRecord(input: unknown): Record<string, unknown> {
  return typeof input === "object" && input !== null
    ? (input as Record<string, unknown>)
    : {}
}

function readSearchText(value: unknown) {
  return typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
    ? String(value).trim().slice(0, catalogFieldLimits.search)
    : catalogSearchDefaults.q
}

function readEnum<TValue extends string>(
  value: unknown,
  values: readonly TValue[],
) {
  return typeof value === "string" && values.includes(value as TValue)
    ? (value as TValue)
    : undefined
}

function readEthAmount(value: unknown) {
  const candidate =
    typeof value === "number" && Number.isFinite(value) && value >= 0
      ? String(value)
      : typeof value === "string"
        ? value.trim()
        : ""

  return isEthAmount(candidate) ? candidate : undefined
}

function readPage(value: unknown) {
  const candidate =
    typeof value === "number"
      ? value
      : typeof value === "string" && /^\d+$/.test(value)
        ? Number(value)
        : Number.NaN

  return Number.isInteger(candidate) && candidate > 0
    ? candidate
    : catalogSearchDefaults.page
}

export function catalogSearchSchema(input: unknown): CatalogSearch {
  const search = readRecord(input)
  const minPriceEth = readEthAmount(search.minPriceEth)
  const maxPriceEth = readEthAmount(search.maxPriceEth)
  const hasInvalidPriceRange =
    minPriceEth !== undefined &&
    maxPriceEth !== undefined &&
    parseEthToWei(minPriceEth) > parseEthToWei(maxPriceEth)

  return {
    q: readSearchText(search.q),
    tab:
      readEnum(search.tab, catalogValues.tabs) ?? catalogSearchDefaults.tab,
    category: readEnum(search.category, catalogValues.categories),
    network: readEnum(search.network, catalogValues.networks),
    minPriceEth: hasInvalidPriceRange ? undefined : minPriceEth,
    maxPriceEth,
    sort:
      readEnum(search.sort, catalogValues.sorts) ?? catalogSearchDefaults.sort,
    page: readPage(search.page),
  }
}
