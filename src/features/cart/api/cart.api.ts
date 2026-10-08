import { httpClient } from "@/shared/api"

import {
  addCartItemInputSchema,
  applyCartCouponInputSchema,
  cartItemIdSchema,
  cartResponseSchema,
  updateCartItemInputSchema,
  type AddCartItemInput,
  type ApplyCartCouponInput,
  type UpdateCartItemInput,
} from "./cart.schemas"

async function getCart(signal?: AbortSignal) {
  const response = await httpClient.get<unknown>("/cart", { signal })

  return cartResponseSchema.parse(response.data)
}

async function addCartItem(input: AddCartItemInput) {
  const body = addCartItemInputSchema.parse(input)
  const response = await httpClient.post<unknown>("/cart/items", body)

  return cartResponseSchema.parse(response.data)
}

async function updateCartItemQuantity(input: UpdateCartItemInput) {
  const { itemId, quantity } = updateCartItemInputSchema.parse(input)
  const response = await httpClient.patch<unknown>(
    `/cart/items/${encodeURIComponent(itemId)}`,
    { quantity },
  )

  return cartResponseSchema.parse(response.data)
}

async function removeCartItem(itemId: string) {
  const parsedItemId = cartItemIdSchema.parse(itemId)
  const response = await httpClient.delete<unknown>(
    `/cart/items/${encodeURIComponent(parsedItemId)}`,
  )

  return cartResponseSchema.parse(response.data)
}

async function applyCartCoupon(input: ApplyCartCouponInput) {
  const body = applyCartCouponInputSchema.parse(input)
  const response = await httpClient.post<unknown>("/cart/coupon", body)

  return cartResponseSchema.parse(response.data)
}

async function removeCartCoupon() {
  const response = await httpClient.delete<unknown>("/cart/coupon")

  return cartResponseSchema.parse(response.data)
}

export const cartApi = {
  addItem: addCartItem,
  applyCoupon: applyCartCoupon,
  get: getCart,
  removeCoupon: removeCartCoupon,
  removeItem: removeCartItem,
  updateItemQuantity: updateCartItemQuantity,
}
