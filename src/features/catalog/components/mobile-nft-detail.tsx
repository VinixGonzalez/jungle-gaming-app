import type { NftDetailItem, NftEdition } from "../api/catalog.schemas"
import type { NftFavoriteActions } from "../model/nft-favorite-actions"
import { MobileNftGallery } from "./mobile-nft-gallery"
import { MobileNftProductInformation } from "./mobile-nft-product-information"
import { MobileNftPurchaseBar } from "./mobile-nft-purchase-bar"

interface MobileNftDetailProps {
  favorite: NftFavoriteActions
  item: NftDetailItem
  selectedEdition: NftEdition
  quantity: number
  isSoldOut: boolean
  availabilityMessage: string
  onBack: () => void
  onEditionChange: (editionId: string) => void
  onQuantityChange: (quantity: number) => void
  onAddToCart: () => void
  onBuy: () => void
  isCartPending: boolean
  cartFeedback: { kind: "status" | "error"; message: string } | null
}

export function MobileNftDetail({
  favorite,
  item,
  selectedEdition,
  quantity,
  isSoldOut,
  availabilityMessage,
  onBack,
  onEditionChange,
  onQuantityChange,
  onAddToCart,
  onBuy,
  isCartPending,
  cartFeedback,
}: MobileNftDetailProps) {
  return (
    <div className="relative mx-auto min-h-224 w-full max-w-3xl overflow-hidden rounded-shell bg-ink text-foreground">
      <main className="pb-44">
        <MobileNftGallery favorite={favorite} item={item} onBack={onBack} />
        <MobileNftProductInformation
          favorite={favorite}
          isSoldOut={isSoldOut}
          item={item}
          onEditionChange={onEditionChange}
          selectedEdition={selectedEdition}
        />
      </main>

      <MobileNftPurchaseBar
        availabilityMessage={availabilityMessage}
        cartFeedback={cartFeedback}
        isCartPending={isCartPending}
        isSoldOut={isSoldOut}
        onAddToCart={onAddToCart}
        onBuy={onBuy}
        onQuantityChange={onQuantityChange}
        quantity={quantity}
        selectedEdition={selectedEdition}
      />
    </div>
  )
}
