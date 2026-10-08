import { useRef } from "react"

import type { useCartQuery } from "@/features/cart"
import { useNftRealtimeListener } from "@/features/catalog"
import { getApiError } from "@/shared/api"

import type { CollectorData } from "../contracts"
import { getCheckoutErrorMessage } from "../model/checkout-error-message"
import { createIdempotencyKey } from "../model/create-idempotency-key"
import { isCheckoutAuthenticationError } from "../model/is-checkout-authentication-error"
import type { useCheckoutMutations } from "./use-checkout-mutations"
import type { useCheckoutState } from "./use-checkout-state"

interface UseCheckoutPaymentActionsOptions {
  cartQuery: ReturnType<typeof useCartQuery>
  mutations: ReturnType<typeof useCheckoutMutations>
  notifyAuthenticationRequired: () => void
  onOrderCreated: (orderId: string) => void
  state: ReturnType<typeof useCheckoutState>
}

export function useCheckoutPaymentActions({
  cartQuery,
  mutations,
  notifyAuthenticationRequired,
  onOrderCreated,
  state,
}: UseCheckoutPaymentActionsOptions) {
  const orderInFlight = useRef(false)
  const quoteInFlight = useRef(false)

  useNftRealtimeListener((event) => {
    const affectedQuoteItem = state.quote?.items.find(
      (item) => item.nftId === event.resourceId,
    )

    if (!affectedQuoteItem || event.version <= affectedQuoteItem.version) return

    state.clearOrderAttempt(
      "O preço ou a disponibilidade de um item mudou em tempo real. Revise a compra novamente.",
    )
  })

  async function createReview(collector: CollectorData) {
    if (quoteInFlight.current) return

    state.update({ feedback: null })

    if (!state.selectedWalletId) {
      state.update({ feedback: "Selecione uma carteira para continuar." })
      return
    }

    if (!state.isSelectionConnected) {
      state.update({
        feedback: "Conecte a carteira selecionada antes de revisar a compra.",
      })
      return
    }

    if (state.pendingOrderRequest) {
      state.update({
        quote: state.pendingOrderRequest.quote,
        isReviewOpen: true,
        feedback:
          "Recupere a tentativa anterior antes de iniciar outro pagamento.",
      })
      return
    }

    quoteInFlight.current = true

    try {
      const nextQuote = await mutations.quote.mutateAsync({
        walletId: state.selectedWalletId,
        network: state.selectedNetwork,
        provider: state.selectedProvider,
        collector,
      })
      state.update({
        pendingOrderRequest: null,
        quote: nextQuote,
        isReviewOpen: true,
        feedback: null,
      })
    } catch (error) {
      if (isCheckoutAuthenticationError(error)) {
        state.saveDraft()
        notifyAuthenticationRequired()
        return
      }

      if (getApiError(error)?.code === "EMPTY_CART") {
        void cartQuery.refetch()
      }

      state.update({ feedback: getCheckoutErrorMessage(error) })
    } finally {
      quoteInFlight.current = false
    }
  }

  async function submitOrder() {
    if (!state.quote || orderInFlight.current) return

    orderInFlight.current = true
    state.update({ feedback: null })
    const existingRequest =
      state.pendingOrderRequest?.quote.id === state.quote.id &&
      state.pendingOrderRequest.quote.revision === state.quote.revision
        ? state.pendingOrderRequest
        : null
    const nextRequest = existingRequest ?? {
      idempotencyKey: createIdempotencyKey(),
      quote: state.quote,
    }

    state.update({ pendingOrderRequest: nextRequest })
    state.saveDraft(nextRequest)

    try {
      const order = await mutations.order.mutateAsync({
        idempotencyKey: nextRequest.idempotencyKey,
        input: {
          quoteId: nextRequest.quote.id,
          quoteRevision: nextRequest.quote.revision,
          collector: nextRequest.quote.collector,
          provider: nextRequest.quote.provider,
        },
      })

      state.completeOrder()
      onOrderCreated(order.id)
    } catch (error) {
      if (isCheckoutAuthenticationError(error)) {
        state.saveDraft(nextRequest)
        notifyAuthenticationRequired()
        return
      }

      const errorCode = getApiError(error)?.code
      const invalidQuoteMessages: Record<string, string> = {
        CHECKOUT_QUOTE_CHANGED:
          "Os valores mudaram. Revise a compra novamente.",
        CHECKOUT_ITEM_UNAVAILABLE:
          "Um item não está mais disponível. Revise seu carrinho.",
        CHECKOUT_QUOTE_EXPIRED:
          "A cotação expirou. Gere uma nova revisão para continuar.",
      }
      const invalidQuoteMessage = errorCode
        ? invalidQuoteMessages[errorCode]
        : undefined

      if (invalidQuoteMessage) {
        state.clearOrderAttempt(invalidQuoteMessage)

        if (errorCode === "CHECKOUT_ITEM_UNAVAILABLE") {
          await cartQuery.refetch()
        }

        return
      }

      state.update({ feedback: getCheckoutErrorMessage(error) })
    } finally {
      orderInFlight.current = false
    }
  }

  return {
    confirmOrder: () => {
      void submitOrder()
    },
    createReview,
  }
}
