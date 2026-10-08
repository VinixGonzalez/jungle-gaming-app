import { http, HttpResponse } from "msw"

import { catalogMockFacade } from "@/features/catalog/mocks"

import {
  addCartItemInputSchema,
  cartItemIdSchema,
  updateCartItemBodySchema,
} from "../api/cart.schemas"
import { cartMockService } from "./cart-mock.service"

type StoredCart = ReturnType<typeof cartMockService.readCart>

interface CartItemHandlerDependencies {
  getAuthenticatedUserId: () => string | null
}

export function createCartItemHandlers({
  getAuthenticatedUserId,
}: CartItemHandlerDependencies) {
  return [
    http.get("/api/cart", async ({ cookies }) => {
      const userId = getAuthenticatedUserId()
      const scenarioResponse =
        await cartMockService.resolveScenarioResponse(cookies)

      if (scenarioResponse) return scenarioResponse

      return HttpResponse.json(
        cartMockService.createCartResponse(cartMockService.readCart(userId)),
      )
    }),

    http.post("/api/cart/items", async ({ cookies, request }) => {
      const userId = getAuthenticatedUserId()
      const scenarioResponse =
        await cartMockService.resolveScenarioResponse(cookies)

      if (scenarioResponse) return scenarioResponse

      const inputResult = addCartItemInputSchema.safeParse(
        await cartMockService.readRequestBody(request),
      )

      if (!inputResult.success) {
        return cartMockService.createInvalidBodyResponse(
          inputResult.error.issues,
        )
      }

      const { nftId, editionId, quantity } = inputResult.data
      const nft = catalogMockFacade.items.find((item) => item.id === nftId)

      if (!nft) {
        return cartMockService.createCartErrorResponse(
          "NFT_NOT_FOUND",
          `No NFT was found for the id "${nftId}".`,
          404,
        )
      }

      const edition = nft.editions.find((item) => item.id === editionId)

      if (!edition) {
        return cartMockService.createCartErrorResponse(
          "NFT_EDITION_NOT_FOUND",
          `No edition was found for the id "${editionId}".`,
          404,
        )
      }

      const cart = cartMockService.readCart(userId)
      const currentItem = cart.items.find(
        (item) => item.nftId === nftId && item.editionId === editionId,
      )
      const nextQuantity = (currentItem?.quantity ?? 0) + quantity

      if (nextQuantity > edition.availableQuantity) {
        return cartMockService.createAvailabilityConflictResponse(
          edition.availableQuantity,
        )
      }

      const nextItem = { nftId, editionId, quantity: nextQuantity }
      const nextCart: StoredCart = {
        ...cart,
        items: currentItem
          ? cart.items.map((item) =>
              item.nftId === nftId && item.editionId === editionId
                ? nextItem
                : item,
            )
          : [...cart.items, nextItem],
      }

      cartMockService.writeCart(userId, nextCart)

      return HttpResponse.json(cartMockService.createCartResponse(nextCart), {
        status: 201,
      })
    }),

    http.patch(
      "/api/cart/items/:itemId",
      async ({ cookies, params, request }) => {
        const userId = getAuthenticatedUserId()
        const scenarioResponse =
          await cartMockService.resolveScenarioResponse(cookies)

        if (scenarioResponse) return scenarioResponse

        const itemIdResult = cartItemIdSchema.safeParse(params.itemId)

        if (!itemIdResult.success) {
          return cartMockService.createItemNotFoundResponse(
            String(params.itemId ?? ""),
          )
        }

        const inputResult = updateCartItemBodySchema.safeParse(
          await cartMockService.readRequestBody(request),
        )

        if (!inputResult.success) {
          return cartMockService.createInvalidBodyResponse(
            inputResult.error.issues,
          )
        }

        const cart = cartMockService.readCart(userId)
        const itemIndex = cart.items.findIndex(
          (item) =>
            cartMockService.createCartItemId(item.editionId) ===
            itemIdResult.data,
        )

        if (itemIndex === -1) {
          return cartMockService.createItemNotFoundResponse(itemIdResult.data)
        }

        const storedItem = cart.items[itemIndex]
        const nft = catalogMockFacade.items.find(
          (item) => item.id === storedItem.nftId,
        )
        const edition = nft?.editions.find(
          (item) => item.id === storedItem.editionId,
        )

        if (!edition) {
          return cartMockService.createItemNotFoundResponse(itemIdResult.data)
        }

        if (inputResult.data.quantity > edition.availableQuantity) {
          return cartMockService.createAvailabilityConflictResponse(
            edition.availableQuantity,
          )
        }

        const nextItems = [...cart.items]
        nextItems[itemIndex] = {
          ...storedItem,
          quantity: inputResult.data.quantity,
        }
        const nextCart = { ...cart, items: nextItems }

        cartMockService.writeCart(userId, nextCart)

        return HttpResponse.json(cartMockService.createCartResponse(nextCart))
      },
    ),

    http.delete("/api/cart/items/:itemId", async ({ cookies, params }) => {
      const userId = getAuthenticatedUserId()
      const scenarioResponse =
        await cartMockService.resolveScenarioResponse(cookies)

      if (scenarioResponse) return scenarioResponse

      const itemIdResult = cartItemIdSchema.safeParse(params.itemId)

      if (!itemIdResult.success) {
        return cartMockService.createItemNotFoundResponse(
          String(params.itemId ?? ""),
        )
      }

      const cart = cartMockService.readCart(userId)
      const nextItems = cart.items.filter(
        (item) =>
          cartMockService.createCartItemId(item.editionId) !== itemIdResult.data,
      )

      if (nextItems.length === cart.items.length) {
        return cartMockService.createItemNotFoundResponse(itemIdResult.data)
      }

      const nextCart = { ...cart, items: nextItems }

      cartMockService.writeCart(userId, nextCart)

      return HttpResponse.json(cartMockService.createCartResponse(nextCart))
    }),
  ]
}
