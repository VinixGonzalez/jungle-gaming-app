import { Button } from "@/shared/components/ui/button"
import { formatEth } from "@/shared/utils"

import type { NftDetailItem, NftEdition } from "../api/catalog.schemas"
import type { NftFavoriteActions } from "../model/nft-favorite-actions"
import { EditionSelector } from "./edition-selector"
import { NftFavoriteButton } from "./nft-favorite-button"
import { NftRatingSummary } from "./nft-rating-summary"
import { NftShareLinks } from "./nft-share-links"
import { QuantityAndPrice } from "./quantity-and-price"

interface NftProductInformationProps {
  item: NftDetailItem
  selectedEdition: NftEdition
  quantity: number
  onEditionChange: (editionId: string) => void
  onQuantityChange: (quantity: number) => void
  onBuy: () => void
  isSoldOut: boolean
  isCartPending: boolean
  availabilityMessage: string
  cartFeedback: { kind: "status" | "error"; message: string } | null
  favorite: NftFavoriteActions
}

export function NftProductInformation({
  item,
  selectedEdition,
  quantity,
  onEditionChange,
  onQuantityChange,
  onBuy,
  isSoldOut,
  isCartPending,
  availabilityMessage,
  cartFeedback,
  favorite,
}: NftProductInformationProps) {
  return (
    <section className="flex h-112 min-w-0 flex-1 flex-col items-start justify-between">
      <div className="flex w-full flex-col gap-3 border-b border-border pb-3">
        <h1 className="text-size-28 leading-normal font-bold text-foreground">
          {item.name}
        </h1>
        <div className="flex items-center justify-between gap-4">
          <p className="text-size-22 leading-size-16 font-bold text-text-accent">
            {formatEth(selectedEdition.priceEth)}
          </p>
          <NftRatingSummary rating={item.rating} />
        </div>
      </div>

      <div className="flex w-full flex-col gap-3">
        <h2 className="text-size-15 leading-size-16 font-bold text-foreground">
          Sobre este NFT:
        </h2>
        <p className="max-w-143.5 text-size-14 leading-size-24 text-text-secondary">
          {item.description}
        </p>
      </div>

      <EditionSelector
        editions={item.editions}
        onValueChange={onEditionChange}
        value={selectedEdition.id}
      />

      <div className="flex items-center gap-5">
        <QuantityAndPrice
          edition={selectedEdition}
          onQuantityChange={onQuantityChange}
          quantity={quantity}
          showPrice={false}
        />
        <div className="flex flex-col items-start gap-1.5">
          <div className="flex items-center gap-2">
            <Button
              aria-describedby="desktop-actions-message"
              className="h-10 w-32.5 text-size-14 leading-size-20 font-bold"
              disabled={isSoldOut || isCartPending}
              onClick={onBuy}
              type="button"
            >
              {isCartPending ? "ADICIONANDO..." : isSoldOut ? "ESGOTADO" : "COMPRAR"}
            </Button>
            <NftFavoriteButton
              describedBy="desktop-favorite-message"
              disabled={favorite.isDisabled || favorite.isPending}
              isFavorite={favorite.isFavorite(item.id)}
              onToggle={() => favorite.toggle(item.id)}
              variant="desktop"
            />
          </div>
          <p
            className="text-size-9 leading-size-14 text-text-secondary"
            id="desktop-actions-message"
          >
            {availabilityMessage}
          </p>
          {cartFeedback ? (
            <p
              className={
                cartFeedback.kind === "error"
                  ? "text-size-10 leading-size-14 text-destructive"
                  : "text-size-10 leading-size-14 text-text-accent"
              }
              role={cartFeedback.kind === "error" ? "alert" : "status"}
            >
              {cartFeedback.message}
            </p>
          ) : null}
          {favorite.feedback ? (
            <p
              className={
                favorite.feedback.kind === "error"
                  ? "text-size-10 leading-size-14 text-destructive"
                  : "text-size-10 leading-size-14 text-text-accent"
              }
              id="desktop-favorite-message"
              role={favorite.feedback.kind === "error" ? "alert" : "status"}
            >
              {favorite.feedback.message}
            </p>
          ) : null}
        </div>
      </div>

      {isSoldOut ? (
        <p className="text-size-14 text-text-accent">NFT esgotado.</p>
      ) : null}

      <div className="flex flex-col gap-3 text-size-15 leading-normal text-secondary">
        <p>ID do token: #{item.tokenId.padStart(4, "0")}</p>
        <p>Coleção: {item.collection.name}</p>
        <p>
          Atributos: {item.attributes.map((attribute) => attribute.value).join(", ")}
        </p>
      </div>

      <NftShareLinks item={item} />
    </section>
  )
}
