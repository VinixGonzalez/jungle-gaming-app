import { useSession } from "@/features/auth"
import { useCartQuery } from "@/features/cart"
import { useWalletsQuery } from "@/features/wallets"

import type { CheckoutOrderCreator } from "../contracts"
import { getCheckoutErrorMessage } from "../model/checkout-error-message"
import { isCheckoutAuthenticationError } from "../model/is-checkout-authentication-error"
import type { CheckoutViewModel } from "../types/checkout-view-model"
import { useCheckoutActions } from "./use-checkout-actions"
import { useCheckoutAuthentication } from "./use-checkout-authentication"
import { useCheckoutMutations } from "./use-checkout-mutations"
import { useCheckoutState } from "./use-checkout-state"

interface UseCheckoutControllerOptions {
  createOrder: CheckoutOrderCreator
  onAuthenticationRequired: () => void
  onOrderCreated: (orderId: string) => void
}

export function useCheckoutController({
  createOrder,
  onAuthenticationRequired,
  onOrderCreated,
}: UseCheckoutControllerOptions): CheckoutViewModel {
  const sessionQuery = useSession()
  const cartQuery = useCartQuery()
  const user = sessionQuery.data?.user
  const walletsQuery = useWalletsQuery(user?.id)
  const connection = walletsQuery.data?.connection ?? null
  const state = useCheckoutState({
    connection,
    user,
    wallets: walletsQuery.data?.wallets,
  })
  const mutations = useCheckoutMutations({
    createOrder,
    userId: user?.id,
  })
  const notifyAuthenticationRequired = useCheckoutAuthentication({
    cartError: cartQuery.error,
    hasSession: Boolean(sessionQuery.data),
    isSessionResolved: sessionQuery.isSuccess,
    onAuthenticationRequired,
    walletsError: walletsQuery.error,
  })
  const actions = useCheckoutActions({
    cartQuery,
    mutations,
    notifyAuthenticationRequired,
    onOrderCreated,
    state,
    wallets: walletsQuery.data?.wallets,
  })
  const retry = () => {
    void sessionQuery.refetch()
    void walletsQuery.refetch()
    void cartQuery.refetch()
  }

  if (sessionQuery.isSuccess && !sessionQuery.data) {
    return { status: "authentication-required", retry }
  }

  if (
    sessionQuery.isPending ||
    walletsQuery.isPending ||
    cartQuery.isPending
  ) {
    return { status: "loading", retry }
  }

  const loadError = walletsQuery.error ?? cartQuery.error ?? sessionQuery.error

  if (loadError) {
    if (isCheckoutAuthenticationError(loadError)) {
      return { status: "authentication-required", retry }
    }

    return {
      status: "error",
      message: getCheckoutErrorMessage(loadError),
      retry,
    }
  }

  if (!cartQuery.data || cartQuery.data.items.length === 0) {
    return { status: "empty", retry }
  }

  if (!walletsQuery.data) {
    return {
      status: "error",
      message: "Não foi possível carregar suas carteiras.",
      retry,
    }
  }

  return {
    status: "ready",
    cart: cartQuery.data,
    connection,
    errors: state.form.formState.errors,
    feedback: state.feedback,
    isConnecting: mutations.connect.isPending,
    isDisconnecting: mutations.disconnect.isPending,
    isOrdering: mutations.order.isPending,
    isQuoting: mutations.quote.isPending,
    isReviewOpen: state.isReviewOpen,
    isSelectionConnected: state.isSelectionConnected,
    quote: state.quote,
    register: state.form.register,
    selectedProvider: state.selectedProvider,
    selectedNetwork: state.selectedNetwork,
    selectedWalletId: state.selectedWalletId,
    wallets: walletsQuery.data.wallets,
    closeReview: () => state.update({ isReviewOpen: false }),
    confirmOrder: actions.confirmOrder,
    connectWallet: actions.connectWallet,
    disconnectWallet: actions.disconnectWallet,
    selectProvider: actions.selectProvider,
    selectNetwork: actions.selectNetwork,
    selectWallet: actions.selectWallet,
    submitForReview: (event) => {
      void state.form.handleSubmit(actions.createReview)(event)
    },
    retry,
  }
}
