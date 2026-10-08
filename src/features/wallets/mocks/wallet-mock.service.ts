import {
  walletSchema,
  walletsResponseSchema,
  type CreateWalletInput,
  type UpdateWalletInput,
  type Wallet,
  type WalletNetwork,
  type WalletProvider,
  type WalletRole,
} from "../api/wallet.schemas"
import { walletMockStorage } from "./wallet-storage"

const walletLimit = 2

function getSupportedNetworks(network: WalletNetwork): WalletNetwork[] {
  if (network === "solana") return ["solana"]

  return network === "ethereum"
    ? ["ethereum", "polygon"]
    : ["polygon", "ethereum"]
}

function getAvailableRole(wallets: readonly Wallet[]): WalletRole | null {
  if (!wallets.some((wallet) => wallet.role === "primary")) return "primary"
  if (!wallets.some((wallet) => wallet.role === "secondary")) {
    return "secondary"
  }

  return null
}

function getComparableAddress(wallet: Pick<Wallet, "address" | "network">) {
  return wallet.network === "solana"
    ? wallet.address
    : wallet.address.toLowerCase()
}

function hasDuplicateAddress(
  wallets: readonly Wallet[],
  wallet: Pick<Wallet, "address" | "network">,
  excludedWalletId?: string,
) {
  const comparableAddress = getComparableAddress(wallet)

  return wallets.some(
    (candidate) =>
      candidate.id !== excludedWalletId &&
      getComparableAddress(candidate) === comparableAddress,
  )
}

export const walletMockService = {
  getWallets(userId: string) {
    const state = walletMockStorage.read(userId)

    return walletsResponseSchema.parse(state)
  },

  createWallet(userId: string, input: CreateWalletInput) {
    const state = walletMockStorage.read(userId)

    if (hasDuplicateAddress(state.wallets, input)) {
      return { status: "duplicate" } as const
    }

    if (state.wallets.length >= walletLimit) {
      return { status: "limit-reached" } as const
    }

    const role = getAvailableRole(state.wallets)

    if (!role) return { status: "limit-reached" } as const

    const result = walletSchema.safeParse({
      id: `wallet_${crypto.randomUUID()}`,
      role,
      label: input.label,
      address: input.address,
      network: input.network,
      supportedNetworks: getSupportedNetworks(input.network),
    })

    if (!result.success) {
      return { status: "invalid", issues: result.error.issues } as const
    }

    walletMockStorage.write(userId, {
      ...state,
      wallets: [...state.wallets, result.data],
    })

    return { status: "success", wallet: result.data } as const
  },

  updateWallet(
    userId: string,
    walletId: string,
    input: UpdateWalletInput,
  ) {
    const state = walletMockStorage.read(userId)
    const currentWallet = state.wallets.find(
      (wallet) => wallet.id === walletId,
    )

    if (!currentWallet) return { status: "not-found" } as const

    const nextNetwork = input.network ?? currentWallet.network
    const result = walletSchema.safeParse({
      ...currentWallet,
      ...input,
      supportedNetworks: getSupportedNetworks(nextNetwork),
    })

    if (!result.success) {
      return { status: "invalid", issues: result.error.issues } as const
    }

    if (hasDuplicateAddress(state.wallets, result.data, walletId)) {
      return { status: "duplicate" } as const
    }

    const changedConnectionIdentity =
      result.data.address !== currentWallet.address ||
      result.data.network !== currentWallet.network
    const connection =
      state.connection?.walletId === walletId && changedConnectionIdentity
        ? null
        : state.connection

    walletMockStorage.write(userId, {
      wallets: state.wallets.map((wallet) =>
        wallet.id === walletId ? result.data : wallet,
      ),
      connection,
    })

    return { status: "success", wallet: result.data } as const
  },

  connectWallet(
    userId: string,
    walletId: string,
    provider: WalletProvider,
    network: WalletNetwork,
  ) {
    const state = walletMockStorage.read(userId)
    const wallet = state.wallets.find((candidate) => candidate.id === walletId)

    if (!wallet) return { status: "not-found" } as const

    if (!wallet.supportedNetworks.includes(network)) {
      return { status: "unsupported-network" } as const
    }

    const connection = {
      walletId: wallet.id,
      provider,
      network,
      connectedAt: new Date().toISOString(),
    }

    walletMockStorage.write(userId, { ...state, connection })

    return { status: "success", connection } as const
  },

  disconnectWallet(userId: string) {
    const state = walletMockStorage.read(userId)

    walletMockStorage.write(userId, { ...state, connection: null })
  },
}
