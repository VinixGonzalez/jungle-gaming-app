import { lazy, Suspense, type ComponentProps } from "react"

import type { SiteFooter, SiteHeader } from "@/shared/components/layout"

import type { NftDetailResponse } from "../api/catalog.schemas"
import { useNftSelection } from "../hooks/use-nft-selection"
import type { NftFavoriteActions } from "../model/nft-favorite-actions"
import type { NftPurchaseActions } from "../model/nft-purchase-actions"
import { MobileNftDetail } from "./mobile-nft-detail"

const DesktopNftDetail = lazy(() =>
  import("./desktop-nft-detail").then((module) => ({
    default: module.DesktopNftDetail,
  })),
)

interface NftDetailContentProps {
  data: NftDetailResponse
  footerConfig: Omit<ComponentProps<typeof SiteFooter>, "className">
  headerConfig: Omit<ComponentProps<typeof SiteHeader>, "className">
  isDesktop: boolean
  onBack: () => void
  favorite: NftFavoriteActions
  purchase: NftPurchaseActions
}

export function NftDetailContent({
  data,
  footerConfig,
  headerConfig,
  isDesktop,
  onBack,
  favorite,
  purchase,
}: NftDetailContentProps) {
  const {
    changeQuantity,
    quantity,
    selectedEdition,
    selectEdition,
  } = useNftSelection(data.item.editions)
  const isSoldOut = data.item.editions.every(
    (edition) => edition.availableQuantity === 0,
  )
  const availabilityMessage = isSoldOut
    ? "Compra indisponível: este NFT está esgotado."
    : "Compra sujeita à disponibilidade da edição selecionada."

  if (!selectedEdition) return null

  function addToCart(destination: "detail" | "cart") {
    purchase.add(
      {
        editionId: selectedEdition.id,
        nftId: data.item.id,
        quantity,
      },
      destination,
    )
  }

  const resolvedHeaderConfig = {
    ...headerConfig,
    cart: {
      ...headerConfig.cart,
      count: purchase.cartCount,
    },
  }

  if (isDesktop) {
    return (
      <Suspense fallback={null}>
        <DesktopNftDetail
          availabilityMessage={availabilityMessage}
          cartFeedback={purchase.feedback}
          favorite={favorite}
          footerConfig={footerConfig}
          headerConfig={resolvedHeaderConfig}
          isCartPending={purchase.isPending}
          isSoldOut={isSoldOut}
          item={data.item}
          onBuy={() => addToCart("cart")}
          onEditionChange={selectEdition}
          onQuantityChange={changeQuantity}
          quantity={quantity}
          relatedItems={data.relatedItems}
          selectedEdition={selectedEdition}
        />
      </Suspense>
    )
  }

  return (
    <MobileNftDetail
      availabilityMessage={availabilityMessage}
      cartFeedback={purchase.feedback}
      favorite={favorite}
      isCartPending={purchase.isPending}
      isSoldOut={isSoldOut}
      item={data.item}
      onAddToCart={() => addToCart("detail")}
      onBack={onBack}
      onBuy={() => addToCart("cart")}
      onEditionChange={selectEdition}
      onQuantityChange={changeQuantity}
      quantity={quantity}
      selectedEdition={selectedEdition}
    />
  )
}
