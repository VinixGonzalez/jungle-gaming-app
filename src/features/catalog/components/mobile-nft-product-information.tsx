import type { NftDetailItem, NftEdition } from "../api/catalog.schemas"
import type { NftFavoriteActions } from "../model/nft-favorite-actions"
import { EditionSelector } from "./edition-selector"
import { NftRatingSummary } from "./nft-rating-summary"

interface MobileNftProductInformationProps {
  favorite: NftFavoriteActions
  item: NftDetailItem
  selectedEdition: NftEdition
  isSoldOut: boolean
  onEditionChange: (editionId: string) => void
}

export function MobileNftProductInformation({
  favorite,
  item,
  selectedEdition,
  isSoldOut,
  onEditionChange,
}: MobileNftProductInformationProps) {
  return (
    <section className="relative -mt-28.5 flex min-h-126 flex-col gap-3 rounded-t-[31px] bg-surface-card px-6 pt-8 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="min-w-0 text-size-20 leading-size-24 font-bold text-foreground">
          {item.name}
        </h1>
        <NftRatingSummary compact rating={item.rating} />
      </div>

      <p className="text-size-14 leading-size-24 text-text-secondary">
        {item.description}
      </p>

      <EditionSelector
        editions={item.editions}
        onValueChange={onEditionChange}
        value={selectedEdition.id}
      />

      {isSoldOut ? (
        <p className="text-size-15 leading-size-20 font-bold text-text-accent">
          NFT esgotado
        </p>
      ) : null}

      {favorite.feedback ? (
        <p
          className={
            favorite.feedback.kind === "error"
              ? "text-size-11 leading-size-16 text-destructive"
              : "text-size-11 leading-size-16 text-text-accent"
          }
          id="mobile-favorite-message"
          role={favorite.feedback.kind === "error" ? "alert" : "status"}
        >
          {favorite.feedback.message}
        </p>
      ) : null}

      <dl className="flex flex-col gap-3 text-size-15 leading-normal text-secondary">
        <div>
          <dt className="sr-only">ID do token</dt>
          <dd>ID do token: #{item.tokenId.padStart(4, "0")}</dd>
        </div>
        <div>
          <dt className="sr-only">Coleção</dt>
          <dd>Coleção: {item.collection.name}</dd>
        </div>
        <div>
          <dt className="sr-only">Atributos</dt>
          <dd>
            Atributos: {item.attributes.map((attribute) => attribute.value).join(", ")}
          </dd>
        </div>
      </dl>
    </section>
  )
}
