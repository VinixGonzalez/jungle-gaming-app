import { httpClient } from "@/shared/api"

import { nftDetailResponseSchema } from "./catalog.schemas"

export async function getNftDetail(slug: string, signal?: AbortSignal) {
  const response = await httpClient.get<unknown>(
    `/nfts/${encodeURIComponent(slug)}`,
    { signal },
  )

  return nftDetailResponseSchema.parse(response.data)
}
