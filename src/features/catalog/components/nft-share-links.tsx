import { Mail } from "lucide-react"

import linkedinIcon from "@/shared/assets/icons/social/linkedin.svg"
import twitterIcon from "@/shared/assets/icons/social/twitter.svg"

import type { NftDetailItem } from "../api/catalog.schemas"

interface NftShareLinksProps {
  item: NftDetailItem
}

export function NftShareLinks({ item }: NftShareLinksProps) {
  const shareUrl =
    typeof window === "undefined"
      ? `/nfts/${item.slug}`
      : window.location.href
  const encodedUrl = encodeURIComponent(shareUrl)
  const encodedTitle = encodeURIComponent(item.name)
  const linkClassName =
    "grid size-8 place-items-center rounded-full text-foreground outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"

  return (
    <div className="flex items-center gap-1" aria-label="Compartilhar este NFT">
      <span className="mr-1 text-size-15 leading-size-16 font-bold text-foreground">
        Compartilhar este NFT:
      </span>
      <a
        aria-label="Compartilhar no LinkedIn"
        className={linkClassName}
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        rel="noreferrer"
        target="_blank"
      >
        <img alt="" src={linkedinIcon} />
      </a>
      <a
        aria-label="Compartilhar por e-mail"
        className={linkClassName}
        href={`mailto:?subject=${encodedTitle}&body=${encodedUrl}`}
      >
        <Mail aria-hidden="true" className="size-4" />
      </a>
      <a
        aria-label="Compartilhar no X"
        className={linkClassName}
        href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
        rel="noreferrer"
        target="_blank"
      >
        <img alt="" src={twitterIcon} />
      </a>
    </div>
  )
}
