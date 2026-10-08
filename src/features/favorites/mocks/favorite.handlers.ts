import { delay, http, HttpResponse } from "msw"

import type { CatalogItem } from "@/features/catalog/contracts"
import { mockApi } from "@/shared/mocks"
import {
  mockScenarioCookieName,
  resolveMockScenario,
} from "@/shared/mocks"

import {
  favoriteNftIdSchema,
  favoritesResponseSchema,
} from "../api/favorite.schemas"
import { favoriteMockService } from "./favorite-mock.service"

const favoriteResponseDelay = 200

interface FavoriteHandlerDependencies {
  getAuthenticatedUserId: () => string | null
  getCatalogItems: () => readonly CatalogItem[]
}

function createFavoriteErrorResponse(
  code: string,
  message: string,
  status: number,
) {
  return mockApi.createErrorResponse(code, message, status)
}

export function createFavoriteHandlers({
  getAuthenticatedUserId,
  getCatalogItems,
}: FavoriteHandlerDependencies) {
  function getScenario(cookies: Record<string, string | undefined>) {
    return resolveMockScenario(
      cookies[mockScenarioCookieName],
      import.meta.env.VITE_MOCK_SCENARIO,
    )
  }

  function createResponse(userId: string) {
    const catalogItems = getCatalogItems()
    const favoriteIds = favoriteMockService
      .getIds(userId)
      .filter((favoriteId) =>
        catalogItems.some((item) => item.id === favoriteId),
      )
    const items = favoriteIds.flatMap((favoriteId) => {
      const item = catalogItems.find((candidate) => candidate.id === favoriteId)

      return item ? [item] : []
    })

    return favoritesResponseSchema.parse({ ids: favoriteIds, items })
  }

  function getAuthenticatedUserIdOrResponse() {
    const userId = getAuthenticatedUserId()

    return userId
      ? { userId }
      : {
          response: createFavoriteErrorResponse(
            "AUTH_REQUIRED",
            "Authentication is required.",
            401,
          ),
        }
  }

  return [
    http.get("/api/favorites", async ({ cookies }) => {
      await delay(favoriteResponseDelay)

      const authentication = getAuthenticatedUserIdOrResponse()

      if ("response" in authentication) return authentication.response

      if (getScenario(cookies) === "favorites-server-error") {
        return createFavoriteErrorResponse(
          "FAVORITES_UNAVAILABLE",
          "The favorites service is temporarily unavailable.",
          503,
        )
      }

      return HttpResponse.json(createResponse(authentication.userId))
    }),

    http.put("/api/favorites/:nftId", async ({ cookies, params }) => {
      const scenario = getScenario(cookies)

      await delay(
        scenario === "favorite-mutation-error"
          ? 800
          : favoriteResponseDelay,
      )

      const authentication = getAuthenticatedUserIdOrResponse()

      if ("response" in authentication) return authentication.response

      if (scenario === "favorite-mutation-error") {
        return createFavoriteErrorResponse(
          "FAVORITE_MUTATION_FAILED",
          "The favorite could not be saved.",
          503,
        )
      }

      const nftIdResult = favoriteNftIdSchema.safeParse(params.nftId)
      const item = nftIdResult.success
        ? getCatalogItems().find(
            (candidate) => candidate.id === nftIdResult.data,
          )
        : undefined

      if (!nftIdResult.success || !item) {
        return createFavoriteErrorResponse(
          "NFT_NOT_FOUND",
          "The selected NFT was not found.",
          404,
        )
      }

      const status = favoriteMockService.add(
        authentication.userId,
        nftIdResult.data,
      )

      return HttpResponse.json(createResponse(authentication.userId), {
        status: status === "created" ? 201 : 200,
      })
    }),

    http.delete("/api/favorites/:nftId", async ({ cookies, params }) => {
      const scenario = getScenario(cookies)

      await delay(
        scenario === "favorite-mutation-error"
          ? 800
          : favoriteResponseDelay,
      )

      const authentication = getAuthenticatedUserIdOrResponse()

      if ("response" in authentication) return authentication.response

      if (scenario === "favorite-mutation-error") {
        return createFavoriteErrorResponse(
          "FAVORITE_MUTATION_FAILED",
          "The favorite could not be removed.",
          503,
        )
      }

      const nftIdResult = favoriteNftIdSchema.safeParse(params.nftId)

      if (!nftIdResult.success) {
        return createFavoriteErrorResponse(
          "NFT_NOT_FOUND",
          "The selected NFT was not found.",
          404,
        )
      }

      favoriteMockService.remove(authentication.userId, nftIdResult.data)

      return HttpResponse.json(createResponse(authentication.userId))
    }),
  ]
}
