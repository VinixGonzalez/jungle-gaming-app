import { z } from "zod"

import { authFieldLimits } from "@/features/auth/contracts"
import {
  walletNetworkSchema,
  walletProviderSchema,
  walletSchema,
} from "@/features/wallets/contracts"
import { ethAmountSchema, positiveEthAmountSchema } from "@/shared/schemas"

import { checkoutFieldLimits } from "../config/checkout-field-limits"

const optionalCollectorFieldSchema = (maxLength: number) =>
  z.string().trim().max(maxLength).optional()

export const collectorDataSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2)
    .max(authFieldLimits.displayName),
  username: z.string().trim().min(3).max(authFieldLimits.username),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(authFieldLimits.email)
    .pipe(z.email()),
  profileName: optionalCollectorFieldSchema(checkoutFieldLimits.profileName),
  secondaryEns: optionalCollectorFieldSchema(authFieldLimits.ensName),
  referralCode: optionalCollectorFieldSchema(
    checkoutFieldLimits.referralCode,
  ),
  ensName: optionalCollectorFieldSchema(authFieldLimits.ensName),
  notes: z.string().trim().max(checkoutFieldLimits.notes).optional(),
})

export const createCheckoutQuoteInputSchema = z.object({
  walletId: z.string().trim().min(1).max(200),
  provider: walletProviderSchema,
  network: walletNetworkSchema,
  collector: collectorDataSchema,
})

export const checkoutQuoteItemSchema = z.object({
  cartItemId: z.string().min(1),
  nftId: z.string().min(1),
  editionId: z.string().min(1),
  name: z.string().min(1),
  tokenId: z.string().regex(/^\d+$/),
  imageUrl: z.string().min(1),
  quantity: z.number().int().positive(),
  unitPriceEth: positiveEthAmountSchema,
  lineTotalEth: positiveEthAmountSchema,
  version: z.number().int().positive(),
})

export const checkoutQuoteCouponSchema = z.object({
  code: z.string().min(1),
  discountPercentage: z.number().int().min(1).max(100),
})

export const checkoutQuoteTotalsSchema = z.object({
  itemCount: z.number().int().positive(),
  subtotalEth: positiveEthAmountSchema,
  discountEth: ethAmountSchema,
  networkFeeEth: ethAmountSchema,
  totalEth: positiveEthAmountSchema,
})

export const checkoutQuoteSchema = z.object({
  id: z.string().min(1),
  revision: z.number().int().positive(),
  createdAt: z.iso.datetime({ offset: true }),
  expiresAt: z.iso.datetime({ offset: true }),
  collector: collectorDataSchema,
  wallet: walletSchema,
  provider: walletProviderSchema,
  network: walletNetworkSchema,
  items: z.array(checkoutQuoteItemSchema).min(1),
  coupon: checkoutQuoteCouponSchema.nullable(),
  totals: checkoutQuoteTotalsSchema,
})

export type CollectorData = z.infer<typeof collectorDataSchema>
export type CreateCheckoutQuoteInput = z.input<
  typeof createCheckoutQuoteInputSchema
>
export type CheckoutQuoteItem = z.infer<typeof checkoutQuoteItemSchema>
export type CheckoutQuoteCoupon = z.infer<typeof checkoutQuoteCouponSchema>
export type CheckoutQuoteTotals = z.infer<typeof checkoutQuoteTotalsSchema>
export type CheckoutQuote = z.infer<typeof checkoutQuoteSchema>
