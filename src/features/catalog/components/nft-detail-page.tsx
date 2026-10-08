import type { ComponentProps } from "react"

import { isHttpClientError } from "@/shared/api"
import type { SiteFooter, SiteHeader } from "@/shared/components/layout"
import {
  useBackNavigation,
  useMediaQuery,
  usePageTitle,
} from "@/shared/hooks"

import { useNftDetailQuery } from "../hooks/use-nft-detail-query"
import type { NftFavoriteActions } from "../model/nft-favorite-actions"
import type { NftPurchaseActions } from "../model/nft-purchase-actions"
import { NftDetailContent } from "./nft-detail-content"
import { NftDetailErrorState } from "./nft-detail-error-state"
import { NftDetailLoadingState } from "./nft-detail-loading-state"

interface NftDetailPageProps {
  slug: string
  headerConfig: Omit<ComponentProps<typeof SiteHeader>, "className">
  footerConfig: Omit<ComponentProps<typeof SiteFooter>, "className">
  favorite: NftFavoriteActions
  purchase: NftPurchaseActions
}

export function NftDetailPage({
  slug,
  headerConfig,
  footerConfig,
  favorite,
  purchase,
}: NftDetailPageProps) {
  const isDesktop = useMediaQuery("(min-width: 1280px)")
  const detailQuery = useNftDetailQuery(slug)
  const returnToPreviousPage = useBackNavigation()
  const isNotFound =
    isHttpClientError(detailQuery.error) &&
    detailQuery.error.response?.status === 404

  usePageTitle(
    detailQuery.data
      ? `${detailQuery.data.item.name} | Kurio`
      : isNotFound
        ? "NFT não encontrado | Kurio"
        : undefined,
  )

  if (
    detailQuery.isPending ||
    (detailQuery.isFetching && !detailQuery.data)
  ) {
    return (
      <NftDetailLoadingState
        headerConfig={headerConfig}
        isDesktop={isDesktop}
      />
    )
  }

  if (!detailQuery.data) {
    return (
      <NftDetailErrorState
        headerConfig={headerConfig}
        isDesktop={isDesktop}
        isNotFound={isNotFound}
        onBack={returnToPreviousPage}
        onRetry={() => void detailQuery.refetch()}
      />
    )
  }

  return (
    <NftDetailContent
      data={detailQuery.data}
      favorite={favorite}
      footerConfig={footerConfig}
      headerConfig={headerConfig}
      isDesktop={isDesktop}
      key={detailQuery.data.item.id}
      onBack={returnToPreviousPage}
      purchase={purchase}
    />
  )
}
