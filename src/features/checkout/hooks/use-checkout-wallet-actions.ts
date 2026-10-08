import { useRef } from "react"

import type {
  Wallet,
  WalletNetwork,
  WalletProvider,
} from "@/features/wallets"

import { getCheckoutErrorMessage } from "../model/checkout-error-message"
import { isCheckoutAuthenticationError } from "../model/is-checkout-authentication-error"
import type { useCheckoutMutations } from "./use-checkout-mutations"
import type { useCheckoutState } from "./use-checkout-state"

interface UseCheckoutWalletActionsOptions {
  mutations: ReturnType<typeof useCheckoutMutations>
  notifyAuthenticationRequired: () => void
  state: ReturnType<typeof useCheckoutState>
  wallets: Wallet[] | undefined
}

export function useCheckoutWalletActions({
  mutations,
  notifyAuthenticationRequired,
  state,
  wallets,
}: UseCheckoutWalletActionsOptions) {
  const walletConnectionInFlight = useRef(false)

  async function connectSelectedWallet() {
    if (walletConnectionInFlight.current) return

    state.update({ feedback: null })

    if (!state.selectedWalletId) {
      state.update({ feedback: "Selecione uma carteira para continuar." })
      return
    }

    walletConnectionInFlight.current = true

    try {
      await mutations.connect.mutateAsync({
        walletId: state.selectedWalletId,
        network: state.selectedNetwork,
        provider: state.selectedProvider,
      })
      state.update({ feedback: "Carteira conectada com sucesso." })
    } catch (error) {
      if (isCheckoutAuthenticationError(error)) {
        state.saveDraft()
        notifyAuthenticationRequired()
        return
      }

      state.update({ feedback: getCheckoutErrorMessage(error) })
    } finally {
      walletConnectionInFlight.current = false
    }
  }

  async function disconnectSelectedWallet() {
    if (walletConnectionInFlight.current) return

    state.update({ feedback: null })

    if (state.pendingOrderRequest) {
      state.update({
        feedback:
          "Recupere a tentativa de pagamento antes de desconectar a carteira.",
      })
      return
    }

    walletConnectionInFlight.current = true

    try {
      await mutations.disconnect.mutateAsync()
      state.clearOrderAttempt("Carteira desconectada.")
    } catch (error) {
      if (isCheckoutAuthenticationError(error)) {
        state.saveDraft()
        notifyAuthenticationRequired()
        return
      }

      state.update({ feedback: getCheckoutErrorMessage(error) })
    } finally {
      walletConnectionInFlight.current = false
    }
  }

  function selectWallet(walletId: string) {
    if (walletId === state.selectedWalletId) return

    if (state.pendingOrderRequest) {
      state.update({
        feedback:
          "Recupere a tentativa de pagamento antes de trocar a carteira.",
      })
      return
    }

    const nextWallet = wallets?.find((wallet) => wallet.id === walletId)

    state.update({
      selectedWalletId: walletId,
      selectedNetwork: nextWallet?.network ?? null,
      pendingOrderRequest: null,
      quote: null,
      isReviewOpen: false,
      feedback: null,
    })
  }

  function selectProvider(provider: WalletProvider) {
    if (provider === state.selectedProvider) return

    if (state.pendingOrderRequest) {
      state.update({
        feedback:
          "Recupere a tentativa de pagamento antes de trocar o provedor.",
      })
      return
    }

    state.update({
      selectedProvider: provider,
      pendingOrderRequest: null,
      quote: null,
      isReviewOpen: false,
      feedback: null,
    })
  }

  function selectNetwork(network: WalletNetwork) {
    if (network === state.selectedNetwork) return

    if (state.pendingOrderRequest) {
      state.update({
        feedback: "Recupere a tentativa de pagamento antes de trocar a rede.",
      })
      return
    }

    if (!state.selectedWallet?.supportedNetworks.includes(network)) return

    state.update({
      selectedNetwork: network,
      pendingOrderRequest: null,
      quote: null,
      isReviewOpen: false,
      feedback: null,
    })
  }

  return {
    connectWallet: () => {
      void connectSelectedWallet()
    },
    disconnectWallet: () => {
      void disconnectSelectedWallet()
    },
    selectNetwork,
    selectProvider,
    selectWallet,
  }
}
