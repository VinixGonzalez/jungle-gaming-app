import type { WalletProvider } from "@/features/wallets/contracts"

import type { CollectorData } from "./api/checkout.schemas"

export {
  checkoutQuoteCouponSchema,
  checkoutQuoteItemSchema,
  checkoutQuoteSchema,
  checkoutQuoteTotalsSchema,
  collectorDataSchema,
  createCheckoutQuoteInputSchema,
} from "./api/checkout.schemas"
export type {
  CheckoutQuote,
  CheckoutQuoteCoupon,
  CheckoutQuoteItem,
  CheckoutQuoteTotals,
  CollectorData,
  CreateCheckoutQuoteInput,
} from "./api/checkout.schemas"

export type CheckoutOrderCreator = (request: {
  idempotencyKey: string
  input: {
    quoteId: string
    quoteRevision: number
    collector: CollectorData
    provider: WalletProvider
  }
}) => Promise<{ id: string }>
