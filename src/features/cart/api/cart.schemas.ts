import { z } from "zod"

import {
  catalogItemSchema,
  nftEditionSchema,
} from "@/features/catalog/contracts"
import { ethAmountSchema } from "@/shared/schemas"

import { cartFieldLimits } from "../config/cart-field-limits"

export const cartItemIdSchema = z.string().trim().min(1).max(200)

export const cartItemSchema = z
  .object({
    id: cartItemIdSchema,
    product: catalogItemSchema,
    edition: nftEditionSchema,
    quantity: z.number().int().positive(),
    lineTotalEth: ethAmountSchema,
  })
  .superRefine((item, context) => {
    if (item.quantity > item.edition.availableQuantity) {
      context.addIssue({
        code: "custom",
        message: "Cart quantity cannot exceed the available quantity",
        path: ["quantity"],
      })
    }
  })

export const cartCouponSchema = z.object({
  code: z.string().min(1),
  discountPercentage: z.number().int().min(1).max(100),
})

export const cartTotalsSchema = z.object({
  itemCount: z.number().int().nonnegative(),
  subtotalEth: ethAmountSchema,
  discountEth: ethAmountSchema,
  networkFeeEth: ethAmountSchema,
  totalEth: ethAmountSchema,
})

export const cartResponseSchema = z.object({
  items: z.array(cartItemSchema),
  coupon: cartCouponSchema.nullable(),
  totals: cartTotalsSchema,
  recommendedItems: z.array(catalogItemSchema).max(5),
})

export const addCartItemInputSchema = z.object({
  nftId: z.string().trim().min(1).max(200),
  editionId: z.string().trim().min(1).max(200),
  quantity: z.number().int().positive(),
})

export const updateCartItemBodySchema = z.object({
  quantity: z.number().int().positive(),
})

export const updateCartItemInputSchema = updateCartItemBodySchema.extend({
  itemId: cartItemIdSchema,
})

export const applyCartCouponInputSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Informe um cupom.")
    .max(
      cartFieldLimits.couponCode,
      `O cupom deve ter no máximo ${cartFieldLimits.couponCode} caracteres.`,
    )
    .transform((code) => code.toUpperCase()),
})

export type CartItem = z.infer<typeof cartItemSchema>
export type CartCoupon = z.infer<typeof cartCouponSchema>
export type CartTotals = z.infer<typeof cartTotalsSchema>
export type CartResponse = z.infer<typeof cartResponseSchema>
export type AddCartItemInput = z.input<typeof addCartItemInputSchema>
export type UpdateCartItemBody = z.input<typeof updateCartItemBodySchema>
export type UpdateCartItemInput = z.input<typeof updateCartItemInputSchema>
export type ApplyCartCouponInput = z.input<typeof applyCartCouponInputSchema>
