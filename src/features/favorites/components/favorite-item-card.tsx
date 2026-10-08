import { HeartOff } from "lucide-react"

import {
  DesktopProductCard,
  MobileProductCard,
} from "@/features/catalog"
import type { CatalogItem } from "@/features/catalog/contracts"
import { IconButton } from "@/shared/components/ui/icon-button"
import { useMediaQuery } from "@/shared/hooks"

interface FavoriteItemCardProps {
  isPending: boolean
  onRemove: () => void
  product: CatalogItem
}

export function FavoriteItemCard({
  isPending,
  onRemove,
  product,
}: FavoriteItemCardProps) {
  const isDesktop = useMediaQuery("(min-width: 1280px)")

  return (
    <div className="relative min-w-0">
      {isDesktop ? (
        <DesktopProductCard product={product} />
      ) : (
        <MobileProductCard product={product} />
      )}
      <IconButton
        className="absolute top-2 right-2 size-9 rounded-full border-border bg-surface-card/95 text-text-accent shadow-md hover:bg-surface-raised"
        disabled={isPending}
        label={`Remover ${product.name} dos favoritos`}
        onClick={onRemove}
        type="button"
        variant="outline"
      >
        <HeartOff aria-hidden="true" className="size-4" />
      </IconButton>
    </div>
  )
}
