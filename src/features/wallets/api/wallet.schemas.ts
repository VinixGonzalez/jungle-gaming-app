import { z } from "zod"

import { walletFieldLimits } from "../config/wallet-field-limits"

const evmAddressPattern = /^0x[a-fA-F0-9]{40}$/
const solanaAddressPattern = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/

const walletLabelSchema = z
  .string()
  .trim()
  .min(2, "O apelido deve ter pelo menos 2 caracteres.")
  .max(
    walletFieldLimits.label,
    `O apelido deve ter no máximo ${walletFieldLimits.label} caracteres.`,
  )
const walletAddressSchema = z
  .string()
  .trim()
  .min(1, "Informe o endereço da carteira.")
  .max(
    walletFieldLimits.address,
    `O endereço deve ter no máximo ${walletFieldLimits.address} caracteres.`,
  )

function isAddressValidForNetwork(address: string, network: WalletNetwork) {
  return network === "solana"
    ? solanaAddressPattern.test(address)
    : evmAddressPattern.test(address)
}

function addAddressIssue(
  address: string,
  network: WalletNetwork,
  context: z.core.$RefinementCtx,
) {
  if (isAddressValidForNetwork(address, network)) return

  context.addIssue({
    code: "custom",
    message:
      network === "solana"
        ? "Informe um endereço válido da rede Solana."
        : "Informe um endereço válido de uma rede EVM.",
    path: ["address"],
  })
}

export const walletNetworkSchema = z.enum([
  "ethereum",
  "polygon",
  "solana",
])

export const walletProviderSchema = z.enum([
  "wallet-connect",
  "metamask",
  "coinbase",
])

export const walletRoleSchema = z.enum(["primary", "secondary"])

export const walletIdSchema = z.string().trim().min(1).max(200)

export const walletSchema = z
  .object({
    id: walletIdSchema,
    role: walletRoleSchema,
    label: walletLabelSchema,
    address: walletAddressSchema,
    network: walletNetworkSchema,
    supportedNetworks: z.array(walletNetworkSchema).min(1),
  })
  .superRefine((wallet, context) => {
    addAddressIssue(wallet.address, wallet.network, context)

    if (!wallet.supportedNetworks.includes(wallet.network)) {
      context.addIssue({
        code: "custom",
        message: "A rede padrão deve ser compatível com a carteira.",
        path: ["network"],
      })
    }
  })

export const walletConnectionSchema = z.object({
  walletId: walletIdSchema,
  provider: walletProviderSchema,
  network: walletNetworkSchema,
  connectedAt: z.iso.datetime({ offset: true }),
})

export const walletsResponseSchema = z.object({
  wallets: z.array(walletSchema),
  connection: walletConnectionSchema.nullable(),
})

export const connectWalletBodySchema = z.object({
  provider: walletProviderSchema,
  network: walletNetworkSchema,
})

export const connectWalletInputSchema = connectWalletBodySchema.extend({
  walletId: walletIdSchema,
})

export const createWalletInputSchema = z
  .object({
    label: walletLabelSchema,
    address: walletAddressSchema,
    network: walletNetworkSchema,
  })
  .superRefine((wallet, context) => {
    addAddressIssue(wallet.address, wallet.network, context)
  })

export const updateWalletInputSchema = z
  .object({
    label: walletLabelSchema.optional(),
    address: walletAddressSchema.optional(),
    network: walletNetworkSchema.optional(),
  })
  .refine(
    (wallet) =>
      wallet.label !== undefined ||
      wallet.address !== undefined ||
      wallet.network !== undefined,
    { message: "Informe ao menos um campo da carteira." },
  )
  .superRefine((wallet, context) => {
    if (wallet.address && wallet.network) {
      addAddressIssue(wallet.address, wallet.network, context)
    }
  })

export type WalletNetwork = z.infer<typeof walletNetworkSchema>
export type WalletProvider = z.infer<typeof walletProviderSchema>
export type WalletRole = z.infer<typeof walletRoleSchema>
export type Wallet = z.infer<typeof walletSchema>
export type WalletConnection = z.infer<typeof walletConnectionSchema>
export type WalletsResponse = z.infer<typeof walletsResponseSchema>
export type ConnectWalletInput = z.input<typeof connectWalletInputSchema>
export type CreateWalletInput = z.input<typeof createWalletInputSchema>
export type UpdateWalletInput = z.input<typeof updateWalletInputSchema>
