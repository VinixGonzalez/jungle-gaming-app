import type { useCartQuery } from "@/features/cart"
import type { Wallet } from "@/features/wallets"

import type { useCheckoutMutations } from "./use-checkout-mutations"
import { useCheckoutPaymentActions } from "./use-checkout-payment-actions"
import type { useCheckoutState } from "./use-checkout-state"
import { useCheckoutWalletActions } from "./use-checkout-wallet-actions"

interface UseCheckoutActionsOptions {
  cartQuery: ReturnType<typeof useCartQuery>
  mutations: ReturnType<typeof useCheckoutMutations>
  notifyAuthenticationRequired: () => void
  onOrderCreated: (orderId: string) => void
  state: ReturnType<typeof useCheckoutState>
  wallets: Wallet[] | undefined
}

export function useCheckoutActions({
  cartQuery,
  mutations,
  notifyAuthenticationRequired,
  onOrderCreated,
  state,
  wallets,
}: UseCheckoutActionsOptions) {
  const paymentActions = useCheckoutPaymentActions({
    cartQuery,
    mutations,
    notifyAuthenticationRequired,
    onOrderCreated,
    state,
  })
  const walletActions = useCheckoutWalletActions({
    mutations,
    notifyAuthenticationRequired,
    state,
    wallets,
  })

  return { ...paymentActions, ...walletActions }
}
