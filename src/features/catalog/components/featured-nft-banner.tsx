import { Link } from "@tanstack/react-router"

import type { CatalogItem } from "../api/catalog.schemas"

interface FeaturedNftBannerProps {
  item: CatalogItem | null
}

export function FeaturedNftBanner({ item }: FeaturedNftBannerProps) {
  if (!item) {
    return null
  }

  return (
    <aside
      aria-label={`NFT em destaque: ${item.name}`}
      className="h-117.5 w-77.5 shrink-0"
    >
      <Link
        aria-label={`Ver detalhes de ${item.name}, NFT em destaque`}
        className="relative flex h-full w-full items-start overflow-hidden bg-linear-to-b from-primary/10 to-primary/3 pt-6 pb-1 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-ink"
        params={{ slug: item.slug }}
        to="/nfts/$slug"
      >
        <div className="flex w-77.5 shrink-0 flex-col items-start gap-4">
          <div className="flex w-full flex-col items-center gap-4 px-5">
            <p className="w-full text-size-24 leading-size-32 font-bold text-text-accent">
              NFT EM DESTAQUE
            </p>
            <p className="w-full truncate text-center text-size-18 leading-size-20 font-bold text-foreground">
              {item.name}
            </p>
          </div>
          <img
            alt=""
            className="h-92 w-77.5 max-w-none rounded-[22px] object-cover"
            src={item.imageUrl}
          />
        </div>

        <span
          aria-hidden="true"
          className="absolute top-74.75 left-4 size-5.5 rounded-[7px] border-2 border-primary opacity-20"
        />
        <span
          aria-hidden="true"
          className="absolute top-85.75 left-62 size-11.25 rounded-full bg-[linear-gradient(145.46deg,rgba(210,138,76,0.3)_46.085%,rgba(210,138,76,0)_103.28%)]"
        />
        <span
          aria-hidden="true"
          className="absolute top-26.25 left-9.5 size-3.75 rounded-full bg-[linear-gradient(145.46deg,rgba(210,138,76,0.3)_46.085%,rgba(210,138,76,0)_103.28%)]"
        />
      </Link>
    </aside>
  )
}
