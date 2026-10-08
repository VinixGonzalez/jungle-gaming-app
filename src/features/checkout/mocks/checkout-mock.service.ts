import type { CartResponse } from "@/features/cart"
import { catalogMockFacade } from "@/features/catalog/mocks"
import type { Wallet } from "@/features/wallets/contracts"
import { walletMockService } from "@/features/wallets/mocks"
import { formatWeiToEth, parseEthToWei } from "@/shared/utils"

import {
  checkoutQuoteSchema,
  type CheckoutQuote,
  type CheckoutQuoteItem,
  type CheckoutQuoteTotals,
  type CreateCheckoutQuoteInput,
} from "../api/checkout.schemas"
import { checkoutMockStorage } from "./checkout-storage"

const quoteDurationMs = 10 * 60 * 1_000
const changedQuoteFeeAdjustmentEth = "0.001"

type CheckoutScenario =
  | "quote-changed"
  | "item-unavailable"
  | null

function createQuoteItems(cart: CartResponse): CheckoutQuoteItem[] | null {
  const items: CheckoutQuoteItem[] = []

  for (const item of cart.items) {
    const nft = catalogMockFacade.items.find(
      (candidate) => candidate.id === item.product.id,
    )

    if (!nft) return null

    items.push({
      cartItemId: item.id,
      nftId: item.product.id,
      editionId: item.edition.id,
      name: item.product.name,
      tokenId: nft.tokenId,
      imageUrl: item.product.imageUrl,
      quantity: item.quantity,
      unitPriceEth: item.edition.priceEth,
      lineTotalEth: formatWeiToEth(
        parseEthToWei(item.edition.priceEth) * BigInt(item.quantity),
      ),
      version: item.product.version,
    })
  }

  return items
}

function createQuoteTotals(
  items: readonly CheckoutQuoteItem[],
  cart: CartResponse,
  networkFeeAdjustmentEth: string | null,
): CheckoutQuoteTotals {
  const subtotalWei = items.reduce(
    (total, item) => total + parseEthToWei(item.lineTotalEth),
    0n,
  )
  const discountWei = cart.coupon
    ? (subtotalWei * BigInt(cart.coupon.discountPercentage)) / 100n
    : 0n
  const networkFeeWei =
    parseEthToWei(cart.totals.networkFeeEth) +
    parseEthToWei(networkFeeAdjustmentEth ?? "0")

  return {
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
    subtotalEth: formatWeiToEth(subtotalWei),
    discountEth: formatWeiToEth(discountWei),
    networkFeeEth: formatWeiToEth(networkFeeWei),
    totalEth: formatWeiToEth(
      subtotalWei - discountWei + networkFeeWei,
    ),
  }
}

function createQuoteSnapshot(
  input: CreateCheckoutQuoteInput,
  wallet: Wallet,
  cart: CartResponse,
  networkFeeAdjustmentEth: string | null,
  previousQuote?: CheckoutQuote,
) {
  const items = createQuoteItems(cart)

  if (!items || items.length === 0) return null

  const createdAt = new Date()

  return checkoutQuoteSchema.parse({
    id: previousQuote?.id ?? `quote_${crypto.randomUUID()}`,
    revision: (previousQuote?.revision ?? 0) + 1,
    createdAt: createdAt.toISOString(),
    expiresAt: new Date(createdAt.getTime() + quoteDurationMs).toISOString(),
    collector: input.collector,
    wallet,
    provider: input.provider,
    network: input.network,
    items,
    coupon: cart.coupon,
    totals: createQuoteTotals(items, cart, networkFeeAdjustmentEth),
  })
}

function createQuoteFingerprint(quote: CheckoutQuote) {
  return JSON.stringify({
    wallet: quote.wallet,
    provider: quote.provider,
    network: quote.network,
    items: [...quote.items]
      .sort((left, right) => left.cartItemId.localeCompare(right.cartItemId))
      .map((item) => ({
        cartItemId: item.cartItemId,
        nftId: item.nftId,
        editionId: item.editionId,
        quantity: item.quantity,
        unitPriceWei: parseEthToWei(item.unitPriceEth).toString(),
        lineTotalWei: parseEthToWei(item.lineTotalEth).toString(),
        version: item.version,
      })),
    coupon: quote.coupon,
    totals: {
      itemCount: quote.totals.itemCount,
      subtotalWei: parseEthToWei(quote.totals.subtotalEth).toString(),
      discountWei: parseEthToWei(quote.totals.discountEth).toString(),
      networkFeeWei: parseEthToWei(
        quote.totals.networkFeeEth,
      ).toString(),
      totalWei: parseEthToWei(quote.totals.totalEth).toString(),
    },
  })
}

function hasExpired(quote: CheckoutQuote) {
  return Date.parse(quote.expiresAt) <= Date.now()
}

export const checkoutMockService = {
  createQuote(
    userId: string,
    input: CreateCheckoutQuoteInput,
    cart: CartResponse,
    scenario: CheckoutScenario = null,
  ) {
    const state = checkoutMockStorage.read(userId)
    const walletState = walletMockService.getWallets(userId)
    const wallet = walletState.wallets.find(
      (candidate) => candidate.id === input.walletId,
    )

    if (!wallet) return { status: "wallet-not-found" } as const

    if (!wallet.supportedNetworks.includes(input.network)) {
      return { status: "unsupported-network" } as const
    }

    if (
      walletState.connection?.walletId !== wallet.id ||
      walletState.connection.provider !== input.provider ||
      walletState.connection.network !== input.network
    ) {
      return { status: "wallet-connection-required" } as const
    }

    const quote = createQuoteSnapshot(
      input,
      wallet,
      cart,
      state.networkFeeAdjustmentEth,
    )

    if (!quote) return { status: "empty-cart" } as const

    checkoutMockStorage.write(userId, {
      ...state,
      quotesById: {
        ...state.quotesById,
        [quote.id]: {
          quote,
          forceChangeOnRevalidation:
            scenario === "quote-changed" &&
            !state.quoteChangeScenarioConsumed,
          forceItemUnavailableOnRevalidation:
            scenario === "item-unavailable" &&
            !state.itemUnavailableScenarioConsumed,
        },
      },
    })

    return { status: "success", quote } as const
  },

  readQuote(userId: string, quoteId: string) {
    return checkoutMockStorage.read(userId).quotesById[quoteId]?.quote ?? null
  },

  revalidateQuote(
    userId: string,
    quoteId: string,
    currentCart: CartResponse,
  ) {
    const state = checkoutMockStorage.read(userId)
    const walletState = walletMockService.getWallets(userId)
    const storedQuote = state.quotesById[quoteId]

    if (!storedQuote) return { status: "missing" } as const

    const { quote } = storedQuote

    if (hasExpired(quote)) return { status: "expired", quote } as const

    if (
      walletState.connection?.walletId !== quote.wallet.id ||
      walletState.connection.provider !== quote.provider ||
      walletState.connection.network !== quote.network
    ) {
      return { status: "wallet-disconnected", quote } as const
    }

    const wallet = walletState.wallets.find(
      (candidate) => candidate.id === quote.wallet.id,
    )

    if (!wallet) return { status: "wallet-disconnected", quote } as const

    if (!wallet.supportedNetworks.includes(quote.network)) {
      return { status: "wallet-disconnected", quote } as const
    }

    if (storedQuote.forceItemUnavailableOnRevalidation) {
      checkoutMockStorage.write(userId, {
        ...state,
        itemUnavailableScenarioConsumed: true,
        quotesById: {
          ...state.quotesById,
          [quoteId]: storedQuote,
        },
      })

      return { status: "item-unavailable", quote } as const
    }

    const networkFeeAdjustmentEth = storedQuote.forceChangeOnRevalidation
      ? (state.networkFeeAdjustmentEth ?? changedQuoteFeeAdjustmentEth)
      : state.networkFeeAdjustmentEth

    const updatedQuote = createQuoteSnapshot(
      {
        collector: quote.collector,
        provider: quote.provider,
        walletId: quote.wallet.id,
        network: quote.network,
      },
      wallet,
      currentCart,
      networkFeeAdjustmentEth,
      quote,
    )

    if (!updatedQuote) return { status: "empty-cart", quote } as const

    const hasChanged =
      storedQuote.forceChangeOnRevalidation ||
      createQuoteFingerprint(quote) !== createQuoteFingerprint(updatedQuote)

    if (!hasChanged) return { status: "valid", quote } as const

    checkoutMockStorage.write(userId, {
      ...state,
      quoteChangeScenarioConsumed:
        state.quoteChangeScenarioConsumed ||
        storedQuote.forceChangeOnRevalidation,
      networkFeeAdjustmentEth,
      quotesById: {
        ...state.quotesById,
        [quoteId]: {
          quote: updatedQuote,
          forceChangeOnRevalidation: false,
          forceItemUnavailableOnRevalidation: false,
        },
      },
    })

    return { status: "changed", quote: updatedQuote } as const
  },
}
