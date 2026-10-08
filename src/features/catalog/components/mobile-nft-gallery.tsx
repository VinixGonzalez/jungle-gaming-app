import { useId, useState } from "react"
import { ArrowLeft } from "lucide-react"

import { Carousel } from "@/shared/components/ui/carousel"
import { CarouselIndicators } from "@/shared/components/ui/carousel-indicators"
import { IconButton } from "@/shared/components/ui/icon-button"

import type { NftDetailItem } from "../api/catalog.schemas"
import type { NftFavoriteActions } from "../model/nft-favorite-actions"
import { NftFavoriteButton } from "./nft-favorite-button"

interface MobileNftGalleryProps {
  favorite: NftFavoriteActions
  item: NftDetailItem
  onBack: () => void
}

export function MobileNftGallery({
  favorite,
  item,
  onBack,
}: MobileNftGalleryProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const gallerySlideId = useId()

  return (
    <Carousel
      activeIndex={activeImageIndex}
      ariaLabel={`Galeria de ${item.name}`}
      className="relative h-126 bg-linear-[137.64deg] from-surface-card from-12% to-surface-raised"
      items={item.gallery}
      loop
      onActiveIndexChange={setActiveImageIndex}
    >
      {({ activeIndex, activeItem, goTo, itemCount }) => (
        <>
          <div className="absolute top-5.75 right-6 left-6 z-20 flex items-center justify-between">
            <IconButton
              className="size-11 rounded-full border-border bg-surface-raised p-0 text-text-secondary hover:bg-surface-dark hover:text-primary"
              label="Voltar"
              onClick={onBack}
              type="button"
              variant="outline"
            >
              <ArrowLeft aria-hidden="true" className="size-5" />
            </IconButton>

            <NftFavoriteButton
              describedBy="mobile-favorite-message"
              disabled={favorite.isDisabled || favorite.isPending}
              isFavorite={favorite.isFavorite(item.id)}
              onToggle={() => favorite.toggle(item.id)}
              variant="mobile"
            />
          </div>

          {activeItem ? (
            <div
              aria-label={`Imagem ${activeIndex + 1} de ${itemCount}`}
              aria-live="polite"
              aria-roledescription="slide"
              id={gallerySlideId}
              role="group"
            >
              <img
                alt={activeItem.alt}
                className="absolute top-16.5 left-1/2 aspect-square w-[calc(100%-3rem)] max-w-89 -translate-x-1/2 rounded-5xl object-cover"
                {...{ fetchpriority: "high" }}
                src={activeItem.thumbnailUrl}
              />
            </div>
          ) : null}

          {itemCount > 1 ? (
            <CarouselIndicators
              activeIndex={activeIndex}
              ariaLabel="Selecionar imagem do NFT"
              className="absolute bottom-27 left-1/2 z-20 -translate-x-1/2 gap-0"
              controlsId={gallerySlideId}
              count={itemCount}
              dotClassName="size-1.75 bg-foreground/60 group-hover:bg-foreground"
              getItemLabel={(index) => `Exibir imagem ${index + 1}`}
              indicatorClassName="size-11"
              onActiveIndexChange={goTo}
            />
          ) : null}
        </>
      )}
    </Carousel>
  )
}
