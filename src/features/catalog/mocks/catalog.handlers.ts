import { delay, http, HttpResponse } from "msw"

import {
  mockScenarioCookieName,
  resolveMockScenario,
  type MockScenario,
} from "@/shared/mocks"
import { mockApi } from "@/shared/mocks"

import {
  catalogQuerySchema,
  catalogResponseSchema,
  nftDetailResponseSchema,
  nftSlugSchema,
} from "../api/catalog.schemas"
import { catalogMockFacade } from "./catalog-mock.facade"

const CATALOG_RESPONSE_DELAY = 0
const CATALOG_SLOW_RESPONSE_DELAY = 1_500
const CATALOG_TIMEOUT_RESPONSE_DELAY = 11_000
const NFT_DETAIL_RESPONSE_DELAY = 0
const NFT_DETAIL_SLOW_RESPONSE_DELAY = 1_500
const NFT_DETAIL_TIMEOUT_RESPONSE_DELAY = 11_000

function getCatalogResponseDelay(scenario: MockScenario, requestUrl: URL) {
  if (scenario === "catalog-slow") return CATALOG_SLOW_RESPONSE_DELAY
  if (scenario === "catalog-timeout") return CATALOG_TIMEOUT_RESPONSE_DELAY

  if (scenario === "catalog-out-of-order") {
    const query = requestUrl.searchParams.get("q")

    if (query === "Genesis") return 1_200
    if (query === "Signal") return 100
  }

  return CATALOG_RESPONSE_DELAY
}

function getNftDetailResponseDelay(scenario: MockScenario) {
  if (scenario === "nft-detail-slow") return NFT_DETAIL_SLOW_RESPONSE_DELAY
  if (scenario === "nft-detail-timeout") {
    return NFT_DETAIL_TIMEOUT_RESPONSE_DELAY
  }

  return NFT_DETAIL_RESPONSE_DELAY
}

function createCatalogUnavailableResponse() {
  return mockApi.createErrorResponse(
    "CATALOG_UNAVAILABLE",
    "The catalog is temporarily unavailable.",
    503,
    { requestId: "mock-catalog-unavailable", retryable: true },
  )
}

function createNftDetailUnavailableResponse() {
  return mockApi.createErrorResponse(
    "NFT_DETAIL_UNAVAILABLE",
    "The NFT detail is temporarily unavailable.",
    503,
    { requestId: "mock-nft-detail-unavailable", retryable: true },
  )
}

function createNftNotFoundResponse(slug: string) {
  return mockApi.createErrorResponse(
    "NFT_NOT_FOUND",
    `No NFT was found for the slug "${slug}".`,
    404,
    { requestId: "mock-nft-not-found" },
  )
}

function readOptionalParam(searchParams: URLSearchParams, name: string) {
  return searchParams.get(name) ?? undefined
}

function readOptionalNumber(searchParams: URLSearchParams, name: string) {
  const value = searchParams.get(name)
  return value === null ? undefined : Number(value)
}

export const catalogHandlers = [
  http.get("/api/nfts/:slug", async ({ cookies, params }) => {
    const scenario = resolveMockScenario(
      cookies[mockScenarioCookieName],
      import.meta.env.VITE_MOCK_SCENARIO,
    )

    await delay(getNftDetailResponseDelay(scenario))

    if (scenario === "nft-detail-server-error") {
      return createNftDetailUnavailableResponse()
    }

    if (scenario === "nft-detail-network-error") {
      return HttpResponse.error()
    }

    const slugResult = nftSlugSchema.safeParse(params.slug)

    if (!slugResult.success) {
      return createNftNotFoundResponse(String(params.slug ?? ""))
    }

    const item = catalogMockFacade.findDetailBySlug(slugResult.data)

    if (!item) {
      return createNftNotFoundResponse(slugResult.data)
    }

    const relatedItems = catalogMockFacade.getRelatedItems(item)

    return HttpResponse.json(
      nftDetailResponseSchema.parse({ item, relatedItems }),
    )
  }),
  http.get("/api/nfts", async ({ cookies, request }) => {
    const url = new URL(request.url)
    const scenario = resolveMockScenario(
      cookies[mockScenarioCookieName],
      import.meta.env.VITE_MOCK_SCENARIO,
    )

    await delay(getCatalogResponseDelay(scenario, url))

    if (scenario === "catalog-server-error") {
      return createCatalogUnavailableResponse()
    }

    if (scenario === "catalog-network-error") {
      return HttpResponse.error()
    }

    const queryResult = catalogQuerySchema.safeParse({
      q: readOptionalParam(url.searchParams, "q"),
      tab: readOptionalParam(url.searchParams, "tab"),
      category: readOptionalParam(url.searchParams, "category"),
      network: readOptionalParam(url.searchParams, "network"),
      minPriceEth: readOptionalParam(url.searchParams, "minPriceEth"),
      maxPriceEth: readOptionalParam(url.searchParams, "maxPriceEth"),
      sort: readOptionalParam(url.searchParams, "sort"),
      page: readOptionalNumber(url.searchParams, "page"),
      pageSize: readOptionalNumber(url.searchParams, "pageSize"),
    })

    if (!queryResult.success) {
      return mockApi.createErrorResponse(
        "INVALID_CATALOG_QUERY",
        "The catalog query parameters are invalid.",
        400,
        {
          fieldErrors: mockApi.createFieldErrors(
            queryResult.error.issues,
            "query",
          ),
        },
      )
    }

    return HttpResponse.json(
      catalogResponseSchema.parse(
        catalogMockFacade.query(
          queryResult.data,
          scenario === "catalog-empty",
        ),
      ),
    )
  }),
]
