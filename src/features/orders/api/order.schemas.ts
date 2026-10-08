import { z } from "zod"

import { walletProviderSchema } from "@/features/wallets/contracts"
import {
  checkoutQuoteSchema,
  collectorDataSchema,
} from "@/features/checkout/contracts"

export const orderIdSchema = z.string().trim().min(1).max(200)

export const orderIdempotencyKeySchema = z.string().trim().min(1).max(200)

export const createOrderInputSchema = z.object({
  quoteId: z.string().trim().min(1).max(200),
  quoteRevision: z.number().int().positive(),
  collector: collectorDataSchema,
  provider: walletProviderSchema,
})

export const orderReceiptSchema = checkoutQuoteSchema.pick({
  id: true,
  revision: true,
  collector: true,
  provider: true,
  wallet: true,
  network: true,
  items: true,
  coupon: true,
  totals: true,
})

const orderBaseSchema = z.object({
  id: orderIdSchema,
  createdAt: z.iso.datetime({ offset: true }),
  updatedAt: z.iso.datetime({ offset: true }),
  version: z.number().int().positive(),
  receipt: orderReceiptSchema,
})

const pendingOrderSchema = orderBaseSchema.extend({
  status: z.literal("pending"),
})

const confirmedOrderSchema = orderBaseSchema.extend({
  status: z.literal("confirmed"),
  transaction: z.object({
    reference: z.string().min(1),
    explorerUrl: z.url(),
    confirmedAt: z.iso.datetime({ offset: true }),
  }),
})

const refusedOrderSchema = orderBaseSchema.extend({
  status: z.literal("refused"),
  refusal: z.object({
    code: z.string().min(1),
    message: z.string().min(1),
    refusedAt: z.iso.datetime({ offset: true }),
  }),
})

export const orderSchema = z.discriminatedUnion("status", [
  pendingOrderSchema,
  confirmedOrderSchema,
  refusedOrderSchema,
])

export type CreateOrderInput = z.input<typeof createOrderInputSchema>
export type OrderReceipt = z.infer<typeof orderReceiptSchema>
export type Order = z.infer<typeof orderSchema>
