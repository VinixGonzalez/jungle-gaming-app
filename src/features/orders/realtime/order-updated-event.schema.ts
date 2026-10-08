import { z } from "zod"

import { orderSchema } from "../api/order.schemas"

export const orderUpdatedEventSchema = z
  .object({
    eventId: z.string().min(1),
    occurredAt: z.iso.datetime({ offset: true }),
    order: orderSchema,
    ownerId: z.string().min(1),
    resourceId: z.string().min(1),
    version: z.number().int().positive(),
  })
  .superRefine((event, context) => {
    if (event.order.id !== event.resourceId) {
      context.addIssue({
        code: "custom",
        message: "The event resource must match the order",
        path: ["resourceId"],
      })
    }

    if (event.order.version !== event.version) {
      context.addIssue({
        code: "custom",
        message: "The event version must match the order version",
        path: ["version"],
      })
    }
  })

export type OrderUpdatedEvent = z.infer<typeof orderUpdatedEventSchema>
