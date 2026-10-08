import type { AuthUser } from "@/features/auth"
import type {
  UpdateWalletInput,
  Wallet,
  WalletsResponse,
} from "@/features/wallets"

export interface AccountHandlerDependencies {
  auth: {
    getAuthenticatedUserId: () => string | null
    getUser: (userId: string) => AuthUser | null
    updateProfile: (
      userId: string,
      input: Pick<
        AuthUser,
        "displayName" | "email" | "ensName" | "username"
      >,
    ) =>
      | { status: "success"; user: AuthUser }
      | { status: "email-conflict" }
      | { status: "username-conflict" }
      | { status: "not-found" }
    updateAvatar: (
      userId: string,
      avatarUrl: string | null,
    ) =>
      | { status: "success"; user: AuthUser }
      | { status: "not-found" }
    changePassword: (
      userId: string,
      currentPassword: string,
      newPassword: string,
    ) => Promise<
      | { status: "success" }
      | { status: "invalid-current-password" }
      | { status: "not-found" }
    >
  }
  wallets: {
    getWallets: (userId: string) => WalletsResponse
    updateWallet: (
      userId: string,
      walletId: string,
      input: UpdateWalletInput,
    ) =>
      | { status: "success"; wallet: Wallet }
      | { status: "duplicate" }
      | { status: "not-found" }
      | {
          status: "invalid"
          issues: readonly { path: PropertyKey[]; message: string }[]
        }
  }
}
