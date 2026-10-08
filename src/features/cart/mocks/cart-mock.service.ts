import { delay, HttpResponse } from "msw"

import { catalogMockFacade } from "@/features/catalog/mocks"
import {
  mockScenarioCookieName,
  resolveMockScenario,
  type MockScenario,
} from "@/shared/mocks"
import { mockApi } from "@/shared/mocks"
import { formatWeiToEth, parseEthToWei } from "@/shared/utils"

import {
  cartResponseSchema,
  type CartItem,
  type CartResponse,
} from "../api/cart.schemas"
import { calculateCartTotals } from "../model/calculate-cart-totals"
import { launchCoupon } from "../model/launch-coupon"
import { cartMockStorage } from "./cart-storage"

type StoredCart = ReturnType<typeof cartMockStorage.read>
type StoredCartItem = StoredCart["items"][number]

interface PurchasedCartItem {
  nftId: string
  editionId: string
  quantity: number
}

const CART_RESPONSE_DELAY = 50
const CART_SLOW_RESPONSE_DELAY = 1_500

function createCartItemId(editionId: string) {
  return `cart-item-${editionId}`
}

function mergeStoredCarts(
  userCart: StoredCart,
  guestCart: StoredCart,
): StoredCart {
  const mergedItems = new Map<string, StoredCartItem>()

  for (const item of [...userCart.items, ...guestCart.items]) {
    const nft = catalogMockFacade.items.find(
      (candidate) => candidate.id === item.nftId,
    )
    const edition = nft?.editions.find(
      (candidate) => candidate.id === item.editionId,
    )

    if (!edition || edition.availableQuantity === 0) continue

    const key = `${item.nftId}:${item.editionId}`
    const currentItem = mergedItems.get(key)

    mergedItems.set(key, {
      nftId: item.nftId,
      editionId: item.editionId,
      quantity: Math.min(
        (currentItem?.quantity ?? 0) + item.quantity,
        edition.availableQuantity,
      ),
    })
  }

  return {
    items: Array.from(mergedItems.values()),
    couponCode: userCart.couponCode ?? guestCart.couponCode,
  }
}

function createCartErrorResponse(
  code: string,
  message: string,
  status: number,
  options: {
    fieldErrors?: Record<string, string[]>
    retryable?: boolean
  } = {},
) {
  return mockApi.createErrorResponse(code, message, status, options)
}

function createCartUnavailableResponse() {
  return createCartErrorResponse(
    "CART_UNAVAILABLE",
    "The cart is temporarily unavailable.",
    503,
    { retryable: true },
  )
}

async function resolveCartScenarioResponse(scenario: MockScenario) {
  await delay(
    scenario === "cart-slow" ? CART_SLOW_RESPONSE_DELAY : CART_RESPONSE_DELAY,
  )

  if (scenario === "cart-server-error") {
    return createCartUnavailableResponse()
  }

  if (scenario === "cart-network-error") {
    return HttpResponse.error()
  }

  return null
}

async function resolveScenarioResponse(
  cookies: Record<string, string | undefined>,
) {
  const scenario = resolveMockScenario(
    cookies[mockScenarioCookieName],
    import.meta.env.VITE_MOCK_SCENARIO,
  )

  return resolveCartScenarioResponse(scenario)
}

function toCartItem(storedItem: StoredCartItem): CartItem | null {
  const nft = catalogMockFacade.items.find(
    (item) => item.id === storedItem.nftId,
  )
  const edition = nft?.editions.find(
    (item) => item.id === storedItem.editionId,
  )

  if (!nft || !edition || edition.availableQuantity === 0) return null

  const quantity = Math.min(storedItem.quantity, edition.availableQuantity)

  return {
    id: createCartItemId(edition.id),
    product: catalogMockFacade.toCatalogItem(nft),
    edition,
    quantity,
    lineTotalEth: formatWeiToEth(
      parseEthToWei(edition.priceEth) * BigInt(quantity),
    ),
  }
}

function getRecommendations(items: readonly CartItem[]) {
  const productIds = new Set(items.map((item) => item.product.id))
  const collectionIds = new Set(
    items.map((item) => item.product.collection.id),
  )
  const candidates = catalogMockFacade.items.filter(
    (nft) => !productIds.has(nft.id),
  )
  const related = candidates.filter((nft) =>
    collectionIds.has(nft.collection.id),
  )
  const remaining = candidates.filter(
    (nft) => !collectionIds.has(nft.collection.id),
  )

  return [...related, ...remaining]
    .slice(0, 5)
    .map((nft) => catalogMockFacade.toCatalogItem(nft))
}

function createCartResponse(cart: StoredCart): CartResponse {
  const items = cart.items
    .map(toCartItem)
    .filter((item): item is CartItem => item !== null)
  const coupon = cart.couponCode === launchCoupon.code ? launchCoupon : null

  return cartResponseSchema.parse({
    items,
    coupon,
    totals: calculateCartTotals(items, coupon),
    recommendedItems: getRecommendations(items),
  })
}

function createInvalidBodyResponse(
  issues: readonly { path: PropertyKey[]; message: string }[],
) {
  return createCartErrorResponse(
    "INVALID_CART_REQUEST",
    "The cart request body is invalid.",
    400,
    { fieldErrors: mockApi.createFieldErrors(issues) },
  )
}

function createItemNotFoundResponse(itemId: string) {
  return createCartErrorResponse(
    "CART_ITEM_NOT_FOUND",
    `No cart item was found for the id "${itemId}".`,
    404,
  )
}

function createAvailabilityConflictResponse(availableQuantity: number) {
  const message =
    availableQuantity === 0
      ? "This edition is no longer available."
      : `Only ${availableQuantity} item(s) are available for this edition.`

  return createCartErrorResponse(
    "CART_ITEM_AVAILABILITY_CONFLICT",
    message,
    409,
    { fieldErrors: { quantity: [message] } },
  )
}

export const cartMockService = {
  claimGuestCart(userId: string) {
    return cartMockStorage.claimGuestCart(userId, mergeStoredCarts)
  },
  createAvailabilityConflictResponse,
  createCartErrorResponse,
  createCartItemId,
  createCartResponse,
  createInvalidBodyResponse,
  createItemNotFoundResponse,
  readCart(userId: string | null) {
    return cartMockStorage.read(userId)
  },
  removePurchasedItems(
    userId: string,
    purchasedItems: readonly PurchasedCartItem[],
  ) {
    const cart = cartMockStorage.read(userId)
    const purchasedQuantityByEdition = purchasedItems.reduce((items, item) => {
      const key = `${item.nftId}:${item.editionId}`

      items.set(key, (items.get(key) ?? 0) + item.quantity)

      return items
    }, new Map<string, number>())
    const items = cart.items.flatMap((item) => {
      const purchasedQuantity =
        purchasedQuantityByEdition.get(`${item.nftId}:${item.editionId}`) ?? 0
      const quantity = item.quantity - purchasedQuantity

      return quantity > 0 ? [{ ...item, quantity }] : []
    })
    const nextCart: StoredCart = {
      items,
      couponCode: items.length > 0 ? cart.couponCode : null,
    }

    cartMockStorage.write(userId, nextCart)

    return createCartResponse(nextCart)
  },
  readRequestBody: mockApi.readJson,
  resolveScenarioResponse,
  writeCart(userId: string | null, cart: StoredCart) {
    cartMockStorage.write(userId, cart)
  },
}
