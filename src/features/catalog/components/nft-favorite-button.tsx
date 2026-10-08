import { Heart } from "lucide-react"

import favoriteDesktopIcon from "@/shared/assets/icons/actions/favorite-outline-desktop.svg"
import favoriteMobileIcon from "@/shared/assets/icons/actions/favorite-outline-mobile.svg"
import { Button } from "@/shared/components/ui/button"
import { IconButton } from "@/shared/components/ui/icon-button"
import { cn } from "@/shared/utils"

interface NftFavoriteButtonProps {
  describedBy?: string
  disabled: boolean
  isFavorite: boolean
  onToggle: () => void
  variant: "desktop" | "mobile"
}

export function NftFavoriteButton({
  describedBy,
  disabled,
  isFavorite,
  onToggle,
  variant,
}: NftFavoriteButtonProps) {
  const label = isFavorite ? "Remover dos favoritos" : "Favoritar NFT"
  const icon = isFavorite ? (
    <Heart
      aria-hidden="true"
      className={variant === "desktop" ? "size-5" : "size-4"}
      fill="currentColor"
    />
  ) : (
    <img
      alt=""
      src={
        variant === "desktop" ? favoriteDesktopIcon : favoriteMobileIcon
      }
    />
  )

  if (variant === "mobile") {
    return (
      <IconButton
        aria-describedby={describedBy}
        aria-pressed={isFavorite}
        className={cn(
          "size-8.75 rounded-full border-border p-0",
          isFavorite
            ? "bg-primary text-ink hover:bg-primary-hover"
            : "bg-surface-raised text-text-accent hover:bg-surface-dark",
        )}
        disabled={disabled}
        label={label}
        onClick={onToggle}
        type="button"
        variant={isFavorite ? "default" : "outline"}
      >
        {icon}
      </IconButton>
    )
  }

  return (
    <Button
      aria-describedby={describedBy}
      aria-pressed={isFavorite}
      className="h-10 w-32.5 gap-2 text-size-14 leading-size-20 font-medium"
      disabled={disabled}
      onClick={onToggle}
      type="button"
      variant={isFavorite ? "default" : "outline"}
    >
      {icon}
      {isFavorite ? "Favoritado" : "Favoritar"}
    </Button>
  )
}
