import { useState } from "react"
import { Maximize2 } from "lucide-react"

import { cn } from "@/shared/utils"

import type { NftDetailItem } from "../api/catalog.schemas"

interface NftGalleryProps {
  item: NftDetailItem
}

export function NftGallery({ item }: NftGalleryProps) {
  const [selectedImageId, setSelectedImageId] = useState(item.gallery[0]?.id)
  const selectedImage =
    item.gallery.find((image) => image.id === selectedImageId) ?? item.gallery[0]

  if (!selectedImage) return null

  return (
    <div
      aria-label={`Galeria de ${item.name}`}
      className="flex h-112 w-143.25 items-start gap-7"
      role="region"
    >
      <div className="flex w-25 flex-col gap-4">
        {item.gallery.map((image) => {
          const isSelected = image.id === selectedImage.id

          return (
            <button
              aria-label={`Exibir ${image.alt}`}
              aria-pressed={isSelected}
              className={cn(
                "size-25 cursor-pointer overflow-hidden rounded-lg border bg-surface-card p-0 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-ink",
                isSelected ? "border-primary" : "border-transparent",
              )}
              key={image.id}
              onClick={() => setSelectedImageId(image.id)}
              type="button"
            >
              <img
                alt=""
                className="size-full object-cover"
                loading={isSelected ? "eager" : "lazy"}
                src={image.thumbnailUrl}
              />
            </button>
          )
        })}
      </div>

      <div className="relative flex size-111 items-center justify-center rounded-md bg-surface-card p-4">
        <img
          alt={selectedImage.alt}
          className="size-101 rounded-5xl object-cover"
          {...{ fetchpriority: "high" }}
          src={selectedImage.imageUrl}
        />
        <a
          aria-label={`Abrir ${selectedImage.alt} em tamanho original`}
          className="absolute top-2 right-2 grid size-11 place-items-center rounded-full text-foreground outline-none transition-colors hover:bg-ink/60 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
          href={selectedImage.imageUrl}
          rel="noreferrer"
          target="_blank"
        >
          <Maximize2 aria-hidden="true" className="size-5" />
        </a>
      </div>
    </div>
  )
}
