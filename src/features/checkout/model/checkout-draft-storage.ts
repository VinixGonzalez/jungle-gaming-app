import { z } from "zod"

import {
  walletNetworkSchema,
  walletProviderSchema,
} from "@/features/wallets/contracts"
import { authFieldLimits } from "@/features/auth/contracts"

import { checkoutQuoteSchema } from "../contracts"
import { checkoutFieldLimits } from "../config/checkout-field-limits"

const storagePrefix = "kurio.checkout.draft"
const currentVersion = 2

const collectorDraftSchema = z.object({
  displayName: z.string().max(authFieldLimits.displayName),
  username: z.string().max(authFieldLimits.username),
  email: z.string().max(authFieldLimits.email),
  profileName: z.string().max(checkoutFieldLimits.profileName),
  secondaryEns: z.string().max(authFieldLimits.ensName),
  referralCode: z.string().max(checkoutFieldLimits.referralCode),
  ensName: z.string().max(authFieldLimits.ensName),
  notes: z.string().max(checkoutFieldLimits.notes),
})

const pendingOrderRequestSchema = z.object({
  idempotencyKey: z.string().min(1).max(200),
  quote: checkoutQuoteSchema,
})

const checkoutDraftSchema = z.object({
  version: z.literal(currentVersion),
  collector: collectorDraftSchema,
  selectedWalletId: z.string().max(200),
  selectedNetwork: walletNetworkSchema.nullable(),
  selectedProvider: walletProviderSchema.nullable(),
  pendingOrderRequest: pendingOrderRequestSchema.nullable(),
})

type CheckoutDraft = z.infer<typeof checkoutDraftSchema>

function getStorageKey(userId: string) {
  return `${storagePrefix}:${encodeURIComponent(userId)}`
}

function load(userId: string) {
  try {
    const rawDraft = window.localStorage.getItem(getStorageKey(userId))

    if (!rawDraft) return null

    const parsedDraft = checkoutDraftSchema.safeParse(JSON.parse(rawDraft))

    if (parsedDraft.success) return parsedDraft.data

    window.localStorage.removeItem(getStorageKey(userId))
    return null
  } catch {
    return null
  }
}

function save(userId: string, draft: Omit<CheckoutDraft, "version">) {
  const parsedDraft = checkoutDraftSchema.safeParse({
    ...draft,
    version: currentVersion,
  })

  if (!parsedDraft.success) return false

  try {
    window.localStorage.setItem(
      getStorageKey(userId),
      JSON.stringify(parsedDraft.data),
    )
    return true
  } catch {
    return false
  }
}

function clear(userId: string) {
  try {
    window.localStorage.removeItem(getStorageKey(userId))
  } catch {
    return
  }
}

export const checkoutDraftStorage = { clear, load, save }
