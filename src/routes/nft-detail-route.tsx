import { lazy, Suspense, useEffect, useState } from "react"
import { useParams } from "@tanstack/react-router"

import { innerPageFooterConfig } from "@/app/config/inner-page-footer.config"
import { marketHeaderConfig } from "@/app/config/market-header.config"
import {
  NftDetailPage,
  type NftFavoriteActions,
  type NftPurchaseActions,
} from "@/features/catalog"

const NftDetailActions = lazy(() =>
  import("./nft-detail-actions").then((module) => ({
    default: module.NftDetailActions,
  })),
)

interface NftDetailActionsValue {
  accountAction: React.ReactNode
  favorite: NftFavoriteActions
  purchase: NftPurchaseActions
}

const pendingActions: NftDetailActionsValue = {
  accountAction: <span aria-hidden="true" className="h-8.75 w-25" />,
  favorite: {
    feedback: null,
    isDisabled: true,
    isFavorite: () => false,
    isPending: true,
    toggle: () => undefined,
  },
  purchase: {
    add: () => undefined,
    cartCount: 0,
    feedback: null,
    isPending: true,
  },
}

export function NftDetailRoute() {
  const { slug } = useParams({ from: "/nfts/$slug" })
  const [actions, setActions] = useState(pendingActions)
  const [canLoadActions, setCanLoadActions] = useState(false)
  const headerConfig = {
    ...marketHeaderConfig,
    accountAction: actions.accountAction,
  }

  useEffect(() => {
    const timeoutId = globalThis.setTimeout(() => setCanLoadActions(true), 500)

    return () => globalThis.clearTimeout(timeoutId)
  }, [])

  return (
    <>
      <NftDetailPage
        footerConfig={innerPageFooterConfig}
        favorite={actions.favorite}
        headerConfig={headerConfig}
        purchase={actions.purchase}
        slug={slug}
      />
      {canLoadActions ? (
        <Suspense fallback={null}>
          <NftDetailActions onChange={setActions} />
        </Suspense>
      ) : null}
    </>
  )
}
