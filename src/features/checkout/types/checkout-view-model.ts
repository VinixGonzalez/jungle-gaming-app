import type { FormEventHandler } from "react"
import type {
  FieldErrors,
  UseFormRegister,
} from "react-hook-form"

import type { CartResponse } from "@/features/cart"
import type {
  Wallet,
  WalletConnection,
  WalletNetwork,
  WalletProvider,
} from "@/features/wallets"

import type {
  CheckoutQuote,
  CollectorData,
} from "../contracts"

interface CommonCheckoutViewModel {
  retry: () => void
}

interface PendingCheckoutViewModel extends CommonCheckoutViewModel {
  status: "authentication-required" | "loading"
}

interface FailedCheckoutViewModel extends CommonCheckoutViewModel {
  status: "error"
  message: string
}

interface EmptyCheckoutViewModel extends CommonCheckoutViewModel {
  status: "empty"
}

interface ReadyCheckoutViewModel extends CommonCheckoutViewModel {
  status: "ready"
  cart: CartResponse
  connection: WalletConnection | null
  errors: FieldErrors<CollectorData>
  feedback: string | null
  isConnecting: boolean
  isDisconnecting: boolean
  isOrdering: boolean
  isQuoting: boolean
  isReviewOpen: boolean
  isSelectionConnected: boolean
  quote: CheckoutQuote | null
  register: UseFormRegister<CollectorData>
  selectedProvider: WalletProvider
  selectedNetwork: WalletNetwork
  selectedWalletId: string
  wallets: Wallet[]
  closeReview: () => void
  confirmOrder: () => void
  connectWallet: () => void
  disconnectWallet: () => void
  selectProvider: (provider: WalletProvider) => void
  selectNetwork: (network: WalletNetwork) => void
  selectWallet: (walletId: string) => void
  submitForReview: FormEventHandler<HTMLFormElement>
}

export type CheckoutViewModel =
  | PendingCheckoutViewModel
  | FailedCheckoutViewModel
  | EmptyCheckoutViewModel
  | ReadyCheckoutViewModel
