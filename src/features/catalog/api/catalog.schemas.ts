import { z } from "zod"

import {
  ethAmountSchema,
  positiveEthAmountSchema,
} from "@/shared/schemas"
import { parseEthToWei } from "@/shared/utils"
import { catalogFieldLimits } from "../config/catalog-field-limits"
import { catalogValues } from "../config/catalog-values"

export const nftCategorySchema = z.enum(catalogValues.categories)

export const nftNetworkSchema = z.enum(catalogValues.networks)

export const catalogTabSchema = z.enum(catalogValues.tabs)

export const catalogSortSchema = z.enum(catalogValues.sorts)

export const nftCollectionSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
})

export const nftEditionSchema = z
  .object({
    id: z.string().min(1),
    totalSupply: z.number().int().positive(),
    availableQuantity: z.number().int().nonnegative(),
    priceEth: positiveEthAmountSchema,
  })
  .superRefine((edition, context) => {
    if (edition.availableQuantity > edition.totalSupply) {
      context.addIssue({
        code: "custom",
        message: "Available quantity cannot exceed edition supply",
        path: ["availableQuantity"],
      })
    }
  })

export const nftSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  tokenId: z.string().regex(/^\d+$/, "Token ID must contain only digits"),
  name: z.string().min(1),
  description: z.string().min(1),
  category: nftCategorySchema,
  network: nftNetworkSchema,
  collection: nftCollectionSchema,
  imageUrl: z.string().min(1),
  thumbnailUrl: z.string().min(1),
  listedAt: z.iso.datetime({ offset: true }),
  trendingScore: z.number().int().min(0).max(100),
  isFeatured: z.boolean(),
  editions: z.array(nftEditionSchema).min(1),
  version: z.number().int().positive(),
})

export const catalogQuerySchema = z
  .object({
    q: z.string().trim().max(catalogFieldLimits.search).default(""),
    tab: catalogTabSchema.default("all"),
    category: nftCategorySchema.optional(),
    network: nftNetworkSchema.optional(),
    minPriceEth: ethAmountSchema.optional(),
    maxPriceEth: ethAmountSchema.optional(),
    sort: catalogSortSchema.default("recent"),
    page: z.number().int().positive().default(1),
    pageSize: z.number().int().min(1).max(50).default(9),
  })
  .superRefine((query, context) => {
    if (
      query.minPriceEth &&
      query.maxPriceEth &&
      parseEthToWei(query.minPriceEth) > parseEthToWei(query.maxPriceEth)
    ) {
      context.addIssue({
        code: "custom",
        message: "Minimum price cannot be greater than maximum price",
        path: ["minPriceEth"],
      })
    }
  })

const categoryFacetSchema = z.object({
  value: nftCategorySchema,
  count: z.number().int().nonnegative(),
})

const networkFacetSchema = z.object({
  value: nftNetworkSchema,
  count: z.number().int().nonnegative(),
})

export const catalogFacetsSchema = z.object({
  categories: z.array(categoryFacetSchema),
  networks: z.array(networkFacetSchema),
  priceRange: z
    .object({
      minEth: ethAmountSchema,
      maxEth: ethAmountSchema,
    })
    .nullable(),
})

export const paginationSchema = z.object({
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  totalItems: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
})

export const catalogItemSchema = nftSchema
  .pick({
    id: true,
    slug: true,
    name: true,
    category: true,
    network: true,
    collection: true,
    imageUrl: true,
    thumbnailUrl: true,
    listedAt: true,
    isFeatured: true,
    version: true,
  })
  .extend({
    priceEth: positiveEthAmountSchema,
    availableQuantity: z.number().int().nonnegative(),
  })

export const catalogResponseSchema = z.object({
  items: z.array(catalogItemSchema),
  featuredItem: catalogItemSchema.nullable(),
  facets: catalogFacetsSchema,
  pagination: paginationSchema,
})

export const nftSlugSchema = z.string().trim().min(1).max(120)

export const nftGalleryImageSchema = z.object({
  id: z.string().min(1),
  imageUrl: z.string().min(1),
  thumbnailUrl: z.string().min(1),
  alt: z.string().min(1),
})

export const nftAttributeSchema = z.object({
  traitType: z.string().min(1),
  value: z.string().min(1),
})

export const nftRatingSchema = z.object({
  average: z.number().min(0).max(5),
  reviewCount: z.number().int().nonnegative(),
})

export const nftCreatorSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
})

export const nftContractSchema = z.object({
  address: z.string().min(1),
  standard: z.string().min(1),
})

export const nftDetailItemSchema = nftSchema.extend({
  gallery: z.array(nftGalleryImageSchema).min(1),
  attributes: z.array(nftAttributeSchema).min(1),
  rating: nftRatingSchema,
  creator: nftCreatorSchema,
  contract: nftContractSchema,
})

export const nftDetailResponseSchema = z.object({
  item: nftDetailItemSchema,
  relatedItems: z.array(catalogItemSchema),
})

export type NftCategory = z.infer<typeof nftCategorySchema>
export type NftNetwork = z.infer<typeof nftNetworkSchema>
export type CatalogTab = z.infer<typeof catalogTabSchema>
export type CatalogSort = z.infer<typeof catalogSortSchema>
export type NftCollection = z.infer<typeof nftCollectionSchema>
export type NftEdition = z.infer<typeof nftEditionSchema>
export type Nft = z.infer<typeof nftSchema>
export type CatalogItem = z.infer<typeof catalogItemSchema>
export type CatalogQuery = z.output<typeof catalogQuerySchema>
export type CatalogQueryInput = z.input<typeof catalogQuerySchema>
export type CatalogFacets = z.infer<typeof catalogFacetsSchema>
export type Pagination = z.infer<typeof paginationSchema>
export type CatalogResponse = z.infer<typeof catalogResponseSchema>
export type NftGalleryImage = z.infer<typeof nftGalleryImageSchema>
export type NftAttribute = z.infer<typeof nftAttributeSchema>
export type NftRating = z.infer<typeof nftRatingSchema>
export type NftCreator = z.infer<typeof nftCreatorSchema>
export type NftContract = z.infer<typeof nftContractSchema>
export type NftDetailItem = z.infer<typeof nftDetailItemSchema>
export type NftDetailResponse = z.infer<typeof nftDetailResponseSchema>
