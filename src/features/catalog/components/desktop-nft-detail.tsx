import type { ComponentProps } from "react"
import { Link } from "@tanstack/react-router"

import { SiteFooter, SiteHeader } from "@/shared/components/layout"

import type {
  CatalogItem,
  NftDetailItem,
  NftEdition,
} from "../api/catalog.schemas"
import type { NftFavoriteActions } from "../model/nft-favorite-actions"
import { NftDetailDescription } from "./nft-detail-description"
import { NftGallery } from "./nft-gallery"
import { NftProductInformation } from "./nft-product-information"
import { NftRelatedProducts } from "./nft-related-products"

interface DesktopNftDetailProps {
  item: NftDetailItem
  relatedItems: readonly CatalogItem[]
  selectedEdition: NftEdition
  quantity: number
  onEditionChange: (editionId: string) => void
  onQuantityChange: (quantity: number) => void
  onBuy: () => void
  isSoldOut: boolean
  isCartPending: boolean
  availabilityMessage: string
  cartFeedback: { kind: "status" | "error"; message: string } | null
  headerConfig: Omit<ComponentProps<typeof SiteHeader>, "className">
  footerConfig: Omit<ComponentProps<typeof SiteFooter>, "className">
  favorite: NftFavoriteActions
}

export function DesktopNftDetail({
  item,
  relatedItems,
  selectedEdition,
  quantity,
  onEditionChange,
  onQuantityChange,
  onBuy,
  isSoldOut,
  isCartPending,
  availabilityMessage,
  cartFeedback,
  headerConfig,
  footerConfig,
  favorite,
}: DesktopNftDetailProps) {
  return (
    <div className="min-h-svh bg-ink text-foreground">
      <div className="mx-auto flex w-full max-w-content flex-col gap-24 py-page-top-desktop">
        <div className="flex flex-col gap-8">
          <SiteHeader {...headerConfig} />

          <main className="flex flex-col gap-24">
            <section className="flex flex-col gap-3">
              <nav aria-label="Breadcrumb" className="text-size-15 leading-size-16 font-bold">
                <Link
                  className="outline-none hover:text-primary focus-visible:text-primary"
                  to="/"
                >
                  Início
                </Link>
                <span aria-hidden="true"> / </span>
                <Link
                  className="outline-none hover:text-primary focus-visible:text-primary"
                  hash="catalogo"
                  to="/"
                >
                  Mercado
                </Link>
              </nav>

              <div className="grid grid-cols-[573px_minmax(0,1fr)] gap-8">
                <NftGallery item={item} />
                <NftProductInformation
                  availabilityMessage={availabilityMessage}
                  cartFeedback={cartFeedback}
                  favorite={favorite}
                  isCartPending={isCartPending}
                  isSoldOut={isSoldOut}
                  item={item}
                  onBuy={onBuy}
                  onEditionChange={onEditionChange}
                  onQuantityChange={onQuantityChange}
                  quantity={quantity}
                  selectedEdition={selectedEdition}
                />
              </div>
            </section>

            <NftDetailDescription item={item} />
            <NftRelatedProducts products={relatedItems} />
          </main>
        </div>

        <SiteFooter {...footerConfig} />
      </div>
    </div>
  )
}
