import { Star } from "lucide-react"

import { cn } from "@/shared/utils"

import type { NftRating } from "../api/catalog.schemas"

interface NftRatingSummaryProps {
  rating: NftRating
  compact?: boolean
  className?: string
}

export function NftRatingSummary({
  rating,
  compact = false,
  className,
}: NftRatingSummaryProps) {
  if (compact) {
    return (
      <div
        aria-label={`${rating.average} de 5, ${rating.reviewCount} avaliações`}
        className={cn(
          "flex h-7 items-center gap-1 rounded-full border border-primary px-2 text-size-14 leading-size-16",
          className,
        )}
      >
        <Star
          aria-hidden="true"
          className="size-3.5 fill-warning text-warning"
        />
        <span className="font-medium text-foreground">{rating.average}</span>
        <span className="text-text-secondary">({rating.reviewCount})</span>
      </div>
    )
  }

  const filledStars = Math.round(rating.average)

  return (
    <div
      aria-label={`${rating.average} de 5, ${rating.reviewCount} avaliações de colecionadores`}
      className={cn("flex items-center gap-1", className)}
    >
      <span aria-hidden="true" className="flex items-center">
        {Array.from({ length: 5 }, (_, index) => (
          <Star
            className={cn(
              "size-3.75 text-warning",
              index < filledStars && "fill-warning",
            )}
            key={index}
          />
        ))}
      </span>
      <span className="text-size-15 leading-normal text-foreground">
        {rating.reviewCount} avaliações de colecionadores
      </span>
    </div>
  )
}
