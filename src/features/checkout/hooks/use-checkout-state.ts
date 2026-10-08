import { useEffect, useMemo, useRef, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useWatch } from "react-hook-form"

import type { AuthUser } from "@/features/auth"
import type {
  Wallet,
  WalletConnection,
  WalletNetwork,
  WalletProvider,
} from "@/features/wallets"

import {
  collectorDataSchema,
  type CheckoutQuote,
  type CollectorData,
} from "../contracts"
import { checkoutCollector } from "../model/checkout-collector"
import { checkoutDraftStorage } from "../model/checkout-draft-storage"

interface PendingOrderRequest {
  idempotencyKey: string
  quote: CheckoutQuote
}

interface LocalCheckoutState {
  ownerId: string | null
  selectedWalletId: string
  selectedNetwork: WalletNetwork | null
  selectedProvider: WalletProvider | null
  pendingOrderRequest: PendingOrderRequest | null
  quote: CheckoutQuote | null
  isReviewOpen: boolean
  feedback: string | null
}

interface UseCheckoutStateOptions {
  connection: WalletConnection | null
  user: AuthUser | undefined
  wallets: Wallet[] | undefined
}

const emptyLocalState: LocalCheckoutState = {
  ownerId: null,
  selectedWalletId: "",
  selectedNetwork: null,
  selectedProvider: null,
  pendingOrderRequest: null,
  quote: null,
  isReviewOpen: false,
  feedback: null,
}

export function useCheckoutState({
  connection,
  user,
  wallets,
}: UseCheckoutStateOptions) {
  const userId = user?.id
  const storedDraft = useMemo(
    () => (userId ? checkoutDraftStorage.load(userId) : null),
    [userId],
  )
  const initialCollector = useMemo(
    () =>
      storedDraft?.collector ??
      (user
        ? checkoutCollector.getDefaults(
            user.displayName,
            user.username,
            user.email,
            user.ensName,
          )
        : checkoutCollector.empty),
    [storedDraft, user],
  )
  const form = useForm<CollectorData>({
    resolver: zodResolver(collectorDataSchema),
    defaultValues: checkoutCollector.empty,
    values: initialCollector,
  })
  const watchedFormValues = useWatch({ control: form.control })
  const watchedCollector = useMemo(
    () => checkoutCollector.normalize(watchedFormValues),
    [watchedFormValues],
  )
  const [localState, setLocalState] =
    useState<LocalCheckoutState>(emptyLocalState)
  const completedOrderOwner = useRef<string | null>(null)
  const ownsLocalState = Boolean(userId && localState.ownerId === userId)
  const preferredWalletId = ownsLocalState
    ? localState.selectedWalletId
    : (storedDraft?.selectedWalletId ?? "")
  const selectedWalletId = wallets?.some(
    (wallet) => wallet.id === preferredWalletId,
  )
    ? preferredWalletId
    : (connection?.walletId ?? wallets?.[0]?.id ?? "")
  const selectedWallet = wallets?.find(
    (wallet) => wallet.id === selectedWalletId,
  )
  const preferredNetwork = ownsLocalState
    ? localState.selectedNetwork
    : storedDraft?.selectedNetwork
  const selectedNetwork =
    (preferredNetwork &&
    selectedWallet?.supportedNetworks.includes(preferredNetwork)
      ? preferredNetwork
      : null) ??
    (connection?.walletId === selectedWalletId &&
    selectedWallet?.supportedNetworks.includes(connection.network)
      ? connection.network
      : null) ??
    selectedWallet?.network ??
    "ethereum"
  const preferredProvider = ownsLocalState
    ? localState.selectedProvider
    : storedDraft?.selectedProvider
  const selectedProvider =
    preferredProvider ??
    (connection?.walletId === selectedWalletId ? connection.provider : null) ??
    "coinbase"
  const candidatePendingOrderRequest = ownsLocalState
    ? localState.pendingOrderRequest
    : (storedDraft?.pendingOrderRequest ?? null)
  const pendingOrderRequest = candidatePendingOrderRequest
  const candidateQuote = ownsLocalState
    ? localState.quote
    : (storedDraft?.pendingOrderRequest?.quote ?? null)
  const quote = pendingOrderRequest
    ? pendingOrderRequest.quote
    : candidateQuote &&
        candidateQuote.wallet.id === selectedWalletId &&
        candidateQuote.network === selectedNetwork &&
        candidateQuote.provider === selectedProvider &&
        checkoutCollector.isSame(
          candidateQuote.collector,
          watchedCollector,
        )
      ? candidateQuote
      : null
  const feedback = ownsLocalState
    ? localState.feedback
    : storedDraft?.pendingOrderRequest
      ? "Encontramos uma tentativa anterior. Revise para recuperar o mesmo pedido."
      : null
  const isReviewOpen = Boolean(
    ownsLocalState && localState.isReviewOpen && quote,
  )
  const isSelectionConnected = Boolean(
    connection &&
      connection.walletId === selectedWalletId &&
      connection.network === selectedNetwork &&
      connection.provider === selectedProvider,
  )

  function getCurrentLocalState(): LocalCheckoutState {
    return {
      ownerId: userId ?? null,
      selectedWalletId,
      selectedNetwork,
      selectedProvider,
      pendingOrderRequest,
      quote,
      isReviewOpen,
      feedback,
    }
  }

  function update(patch: Partial<LocalCheckoutState>) {
    if (!userId) return

    setLocalState((current) => ({
      ...(current.ownerId === userId ? current : getCurrentLocalState()),
      ...patch,
      ownerId: userId,
    }))
  }

  function saveDraft(nextPendingOrderRequest = pendingOrderRequest) {
    if (!userId) return

    checkoutDraftStorage.save(userId, {
      collector: checkoutCollector.normalize(form.getValues()),
      selectedWalletId,
      selectedNetwork,
      selectedProvider,
      pendingOrderRequest: nextPendingOrderRequest,
    })
  }

  function clearOrderAttempt(feedbackMessage: string | null = null) {
    update({
      pendingOrderRequest: null,
      quote: null,
      isReviewOpen: false,
      feedback: feedbackMessage,
    })
    saveDraft(null)
  }

  function completeOrder() {
    if (userId) {
      completedOrderOwner.current = userId
      checkoutDraftStorage.clear(userId)
    }

    update({
      pendingOrderRequest: null,
      quote: null,
      isReviewOpen: false,
    })
  }

  useEffect(() => {
    if (!userId || completedOrderOwner.current === userId) return

    checkoutDraftStorage.save(userId, {
      collector: watchedCollector,
      selectedWalletId,
      selectedNetwork,
      selectedProvider,
      pendingOrderRequest,
    })
  }, [
    pendingOrderRequest,
    selectedProvider,
    selectedNetwork,
    selectedWalletId,
    userId,
    watchedCollector,
  ])

  return {
    clearOrderAttempt,
    completeOrder,
    feedback,
    form,
    isReviewOpen,
    isSelectionConnected,
    pendingOrderRequest,
    quote,
    saveDraft,
    selectedNetwork,
    selectedProvider,
    selectedWallet,
    selectedWalletId,
    update,
    watchedCollector,
  }
}
