import { httpClient } from "@/shared/api"

import {
  connectWalletInputSchema,
  createWalletInputSchema,
  updateWalletInputSchema,
  walletConnectionSchema,
  walletIdSchema,
  walletSchema,
  walletsResponseSchema,
  type ConnectWalletInput,
  type CreateWalletInput,
  type UpdateWalletInput,
} from "./wallet.schemas"

async function getWallets(signal?: AbortSignal) {
  const response = await httpClient.get<unknown>("/wallets", { signal })

  return walletsResponseSchema.parse(response.data)
}

async function createWallet(input: CreateWalletInput) {
  const body = createWalletInputSchema.parse(input)
  const response = await httpClient.post<unknown>("/wallets", body)

  return walletSchema.parse(response.data)
}

async function updateWallet(walletId: string, input: UpdateWalletInput) {
  const parsedWalletId = walletIdSchema.parse(walletId)
  const body = updateWalletInputSchema.parse(input)
  const response = await httpClient.patch<unknown>(
    `/wallets/${encodeURIComponent(parsedWalletId)}`,
    body,
  )

  return walletSchema.parse(response.data)
}

async function connectWallet(input: ConnectWalletInput) {
  const { walletId, provider, network } = connectWalletInputSchema.parse(input)
  const response = await httpClient.post<unknown>(
    `/wallets/${encodeURIComponent(walletId)}/connect`,
    { provider, network },
  )

  return walletConnectionSchema.parse(response.data)
}

async function disconnectWallet() {
  await httpClient.delete("/wallets/connection")
}

export const walletsApi = {
  connect: connectWallet,
  create: createWallet,
  disconnect: disconnectWallet,
  get: getWallets,
  update: updateWallet,
}
