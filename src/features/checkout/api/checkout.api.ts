import { httpClient } from "@/shared/api"

import {
  checkoutQuoteSchema,
  createCheckoutQuoteInputSchema,
  type CreateCheckoutQuoteInput,
} from "./checkout.schemas"

async function createQuote(input: CreateCheckoutQuoteInput) {
  const body = createCheckoutQuoteInputSchema.parse(input)
  const response = await httpClient.post<unknown>("/checkout/quotes", body)

  return checkoutQuoteSchema.parse(response.data)
}

export const checkoutApi = {
  createQuote,
}
