import {
  emeraldApeArtwork,
  goldenBeatArtwork,
  ivoryBaronArtwork,
  sageNomadArtwork,
} from "@/shared/assets/artworks"

type BlogPost = {
  date: string
  readingTime: string
  title: string
  description: string
  image: string
  imageAlt: string
}

export const blogPosts: readonly BlogPost[] = [
  {
    date: "12 de setembro",
    readingTime: "Leitura de 6 min",
    title: "Como funciona a propriedade de NFTs",
    description: "Aprenda a colecionar, negociar e verificar ativos digitais.",
    image: ivoryBaronArtwork,
    imageAlt: "Arte digital de um macaco de terno claro",
  },
  {
    date: "13 de setembro",
    readingTime: "Leitura de 2 min",
    title: "10 artistas digitais para acompanhar",
    description: "Conheça criadores que moldam a cultura digital.",
    image: emeraldApeArtwork,
    imageAlt: "Arte digital de um macaco com óculos",
  },
  {
    date: "15 de setembro",
    readingTime: "Leitura de 3 min",
    title: "Raridade, atributos e procedência",
    description:
      "Entenda raridade, procedência, direitos autorais e utilidade.",
    image: sageNomadArtwork,
    imageAlt: "Arte digital de um macaco com chapéu",
  },
  {
    date: "15 de setembro",
    readingTime: "Leitura de 2 min",
    title: "Como proteger sua carteira",
    description: "Proteja sua carteira, seus ativos e sua identidade.",
    image: goldenBeatArtwork,
    imageAlt: "Arte digital de um macaco dourado com fones de ouvido",
  },
]
