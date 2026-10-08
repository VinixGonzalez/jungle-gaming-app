import { checkoutMockService } from "@/features/checkout/mocks"
import { cartMockService } from "@/features/cart/mocks"
import { catalogMockFacade } from "@/features/catalog/mocks"

import {
  createOrderInputSchema,
  orderReceiptSchema,
  orderSchema,
  type CreateOrderInput,
  type Order,
} from "../api/order.schemas"
import { orderMockStorage } from "./order-storage"

function createFingerprint(input: CreateOrderInput) {
  return JSON.stringify(createOrderInputSchema.parse(input))
}

function hasSameQuoteData(
  input: CreateOrderInput,
  quote: NonNullable<ReturnType<typeof checkoutMockService.readQuote>>,
) {
  return (
    input.quoteRevision === quote.revision &&
    input.provider === quote.provider &&
    JSON.stringify(input.collector) === JSON.stringify(quote.collector)
  )
}

function createPendingOrder(
  quote: NonNullable<ReturnType<typeof checkoutMockService.readQuote>>,
): Order {
  const now = new Date().toISOString()

  return orderSchema.parse({
    id: `order_${crypto.randomUUID()}`,
    status: "pending",
    createdAt: now,
    updatedAt: now,
    version: 1,
    receipt: orderReceiptSchema.parse({
      id: quote.id,
      revision: quote.revision,
      collector: quote.collector,
      wallet: quote.wallet,
      provider: quote.provider,
      network: quote.network,
      items: quote.items,
      coupon: quote.coupon,
      totals: quote.totals,
    }),
  })
}

function createTransactionReference() {
  return `0x${crypto.randomUUID().replaceAll("-", "")}${crypto.randomUUID().replaceAll("-", "")}`
}

function createExplorerUrl(
  network: Order["receipt"]["network"],
  reference: string,
) {
  const explorerByNetwork = {
    ethereum: "https://etherscan.io/tx",
    polygon: "https://polygonscan.com/tx",
    solana: "https://solscan.io/tx",
  } as const

  return `${explorerByNetwork[network]}/${reference}`
}

function createRefusedOrder(
  userId: string,
  order: Order,
  code: string,
  message: string,
) {
  const refusedAt = new Date().toISOString()
  const refusedOrder = orderSchema.parse({
    ...order,
    status: "refused",
    updatedAt: refusedAt,
    version: order.version + 1,
    refusal: { code, message, refusedAt },
  })

  orderMockStorage.update(userId, refusedOrder)

  return refusedOrder
}

export const orderMockService = {
  create(
    userId: string,
    input: CreateOrderInput,
    idempotencyKey: string,
  ) {
    const parsedInput = createOrderInputSchema.parse(input)
    const fingerprint = createFingerprint(parsedInput)
    const idempotencyRecord = orderMockStorage.findIdempotencyRecord(
      userId,
      idempotencyKey,
    )

    if (idempotencyRecord) {
      if (idempotencyRecord.fingerprint !== fingerprint) {
        return { status: "idempotency-conflict" } as const
      }

      const existingOrder = orderMockStorage.find(
        userId,
        idempotencyRecord.orderId,
      )

      if (existingOrder) {
        return { status: "existing", order: existingOrder } as const
      }
    }

    const currentCart = cartMockService.createCartResponse(
      cartMockService.readCart(userId),
    )
    const quoteResult = checkoutMockService.revalidateQuote(
      userId,
      parsedInput.quoteId,
      currentCart,
    )

    if (quoteResult.status !== "valid") return quoteResult

    if (!hasSameQuoteData(parsedInput, quoteResult.quote)) {
      return { status: "quote-changed", quote: quoteResult.quote } as const
    }

    const order = orderMockStorage.insert(
      userId,
      createPendingOrder(quoteResult.quote),
      idempotencyKey,
      fingerprint,
    )

    return { status: "created", order } as const
  },

  find(userId: string, orderId: string) {
    return orderMockStorage.find(userId, orderId)
  },

  confirm(userId: string, orderId: string) {
    const order = orderMockStorage.find(userId, orderId)

    if (!order || order.status !== "pending") return order

    const inventoryResult = catalogMockFacade.purchase(
      order.id,
      order.receipt.items.map((item) => ({
        nftId: item.nftId,
        editionId: item.editionId,
        quantity: item.quantity,
      })),
    )

    if (inventoryResult.status === "unavailable") {
      return createRefusedOrder(
        userId,
        order,
        "CHECKOUT_ITEM_UNAVAILABLE",
        "An item in this order is no longer available.",
      )
    }

    const confirmedAt = new Date().toISOString()
    const reference = createTransactionReference()
    const confirmedOrder = orderSchema.parse({
      ...order,
      status: "confirmed",
      updatedAt: confirmedAt,
      version: order.version + 1,
      transaction: {
        reference,
        explorerUrl: createExplorerUrl(order.receipt.network, reference),
        confirmedAt,
      },
    })

    orderMockStorage.update(userId, confirmedOrder)
    cartMockService.removePurchasedItems(
      userId,
      order.receipt.items.map((item) => ({
        nftId: item.nftId,
        editionId: item.editionId,
        quantity: item.quantity,
      })),
    )

    return confirmedOrder
  },

  refuse(userId: string, orderId: string) {
    const order = orderMockStorage.find(userId, orderId)

    if (!order || order.status !== "pending") return order

    return createRefusedOrder(
      userId,
      order,
      "PAYMENT_REFUSED",
      "The simulated payment was refused.",
    )
  },
}
