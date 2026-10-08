import { z } from "zod"

export const realtimeSubscriptionSchema = z.object({
  nftIds: z.array(z.string().min(1)).max(100),
  orderIds: z.array(z.string().min(1)).max(20),
  ownerId: z.string().min(1),
})

export type RealtimeSubscription = z.infer<
  typeof realtimeSubscriptionSchema
>
