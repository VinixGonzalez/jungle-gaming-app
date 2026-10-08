import {
  emeraldApeArtwork,
  ivoryBaronArtwork,
} from "@/shared/assets/artworks"

type PromoCard = {
  title: readonly [string, string]
  description: string
  image: string
  imageAlt: string
}

export const promoCards: readonly PromoCard[] = [
  {
    title: ["Lançamentos gênesis", "de edição limitada"],
    description:
      "Colecione edições escassas diretamente dos criadores antes da revelação pública.",
    image: emeraldApeArtwork,
    imageAlt: "NFT de um macaco com óculos e fundo em tons de marrom",
  },
  {
    title: ["Arte digital selecionada", "e muito mais"],
    description:
      "Explore novos artistas, coleções verificadas e obras digitais que definem a cultura.",
    image: ivoryBaronArtwork,
    imageAlt: "NFT de um macaco de terno claro em fundo preto",
  },
]
