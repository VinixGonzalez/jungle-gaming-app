import { identityQueryCache } from "@/shared/query"

const favoritesQueryRoot = [
  ...identityQueryCache.rootKey,
  "favorites",
] as const

export const favoritesQueryKeys = {
  byOwner: (ownerId: string) => [...favoritesQueryRoot, ownerId] as const,
}
