import { identityQueryCache } from "@/shared/query"

const ordersRootKey = [...identityQueryCache.rootKey, "orders"] as const

export const ordersQueryKeys = {
  all: ordersRootKey,
  byOwner: (ownerId: string) => [...ordersRootKey, ownerId] as const,
  detail: (ownerId: string, orderId: string) =>
    [...ordersRootKey, ownerId, orderId] as const,
}
