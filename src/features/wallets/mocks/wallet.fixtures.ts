import { walletSchema, type Wallet } from "../api/wallet.schemas"

const walletsByUserId: Record<string, Wallet[]> = {
  "user_luna-rocha": [
    {
      id: "wallet_luna_primary",
      role: "primary",
      label: "Carteira principal",
      address: "0x8A1f06c5F8B90df6D7D00CE9AbF8D38E5DA93417",
      network: "ethereum",
      supportedNetworks: ["ethereum", "polygon"],
    },
    {
      id: "wallet_luna_secondary",
      role: "secondary",
      label: "Carteira secundária",
      address: "0x21C79D61483eA5315f92Bf035a1cB56E277A089D",
      network: "polygon",
      supportedNetworks: ["polygon", "ethereum"],
    },
  ],
  "user_davi-moura": [
    {
      id: "wallet_davi_primary",
      role: "primary",
      label: "Carteira principal",
      address: "6YwTqBdL49ZVhs81JuK3rGTXQQLBmXYaFzZqch9hRqJc",
      network: "solana",
      supportedNetworks: ["solana"],
    },
    {
      id: "wallet_davi_secondary",
      role: "secondary",
      label: "Carteira secundária",
      address: "0x72d58B1fB0Ba9E4f80565B3A151825A5f7DfA404",
      network: "ethereum",
      supportedNetworks: ["ethereum", "polygon"],
    },
  ],
}

export const walletFixtures = {
  getByUserId(userId: string) {
    return walletSchema.array().parse(walletsByUserId[userId] ?? [])
  },
}
