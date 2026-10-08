import { httpClient } from "@/shared/api"

import {
  catalogQuerySchema,
  catalogResponseSchema,
  type CatalogQueryInput,
} from "./catalog.schemas"

export async function getCatalog(
  input: CatalogQueryInput,
  signal?: AbortSignal,
) {
  const query = catalogQuerySchema.parse(input)
  const response = await httpClient.get<unknown>("/nfts", {
    params: query,
    signal,
  })

  return catalogResponseSchema.parse(response.data)
}
