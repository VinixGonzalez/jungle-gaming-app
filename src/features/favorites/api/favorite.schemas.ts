import { z } from "zod"

import { catalogItemSchema } from "@/features/catalog/contracts"

export const favoriteNftIdSchema = z.string().trim().min(1).max(200)

export const favoritesResponseSchema = z.object({
  ids: z.array(favoriteNftIdSchema),
  items: z.array(catalogItemSchema),
})

export type FavoritesResponse = z.infer<typeof favoritesResponseSchema>
