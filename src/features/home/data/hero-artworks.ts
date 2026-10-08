import {
  emeraldApeArtwork,
  emeraldApeArtworkMobile,
  goldenBeatArtwork,
  goldenBeatArtworkMobile,
  ivoryBaronArtwork,
  ivoryBaronArtworkMobile,
  sageNomadArtwork,
  sageNomadArtworkMobile,
} from "@/shared/assets/artworks"

type HeroArtwork = {
  id: string
  desktopImage: string
  mobileImage: string
  alt: string
}

export const heroArtworks: readonly HeroArtwork[] = [
  {
    id: "emerald-ape",
    desktopImage: emeraldApeArtwork,
    mobileImage: emeraldApeArtworkMobile,
    alt: "NFT de um macaco com óculos e fundo em tons de marrom",
  },
  {
    id: "sage-nomad",
    desktopImage: sageNomadArtwork,
    mobileImage: sageNomadArtworkMobile,
    alt: "NFT de um macaco com chapéu em fundo verde",
  },
  {
    id: "ivory-baron",
    desktopImage: ivoryBaronArtwork,
    mobileImage: ivoryBaronArtworkMobile,
    alt: "NFT de um macaco de terno claro em fundo preto",
  },
  {
    id: "golden-beat",
    desktopImage: goldenBeatArtwork,
    mobileImage: goldenBeatArtworkMobile,
    alt: "NFT de um macaco dourado com fones de ouvido",
  },
]
