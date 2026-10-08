import { identityQueryCache } from "@/shared/query"

const walletsQueryRoot = [...identityQueryCache.rootKey, "wallets"] as const

export const walletsQueryKeys = {
  byOwner: (ownerId: string) => [...walletsQueryRoot, ownerId] as const,
}
