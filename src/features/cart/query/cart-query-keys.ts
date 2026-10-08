import { identityQueryCache } from "@/shared/query"

const cartQueryRoot = [...identityQueryCache.rootKey, "cart"] as const

export const cartQueryKeys = {
  all: cartQueryRoot,
  byOwner: (ownerId: string) => [...cartQueryRoot, ownerId] as const,
}
