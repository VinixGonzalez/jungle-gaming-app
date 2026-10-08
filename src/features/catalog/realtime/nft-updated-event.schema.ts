import { z } from "zod"

import {
  catalogItemSchema,
  nftEditionSchema,
} from "../api/catalog.schemas"

export const nftUpdatedEventSchema = z
  .object({
    editions: z.array(nftEditionSchema).min(1),
    eventId: z.string().min(1),
    item: catalogItemSchema,
    occurredAt: z.iso.datetime({ offset: true }),
    resourceId: z.string().min(1),
    version: z.number().int().positive(),
  })
  .superRefine((event, context) => {
    if (event.item.id !== event.resourceId) {
      context.addIssue({
        code: "custom",
        message: "The event resource must match the NFT item",
        path: ["resourceId"],
      })
    }

    if (event.item.version !== event.version) {
      context.addIssue({
        code: "custom",
        message: "The event version must match the NFT item version",
        path: ["version"],
      })
    }
  })

export type NftUpdatedEvent = z.infer<typeof nftUpdatedEventSchema>
