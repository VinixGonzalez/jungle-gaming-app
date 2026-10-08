import type {
  CatalogSort,
  CatalogTab,
  NftCategory,
  NftNetwork,
} from "../api/catalog.schemas"

const tabs = [
  { value: "all", label: "Todos os NFTs" },
  { value: "new", label: "Novos lançamentos" },
  { value: "trending", label: "Em alta" },
] as const satisfies ReadonlyArray<{ value: CatalogTab; label: string }>

const sortOptions = [
  { value: "recent", label: "Listados recentemente" },
  { value: "price-asc", label: "Menor preço" },
  { value: "price-desc", label: "Maior preço" },
] as const satisfies ReadonlyArray<{ value: CatalogSort; label: string }>

const categoryLabels = {
  "digital-art": "Arte digital",
  photography: "Fotografia",
  music: "Música",
  collectibles: "Colecionáveis",
  "generative-art": "Arte generativa",
  gaming: "Jogos",
} as const satisfies Record<NftCategory, string>

const networkLabels = {
  ethereum: "Ethereum",
  polygon: "Polygon",
  solana: "Solana",
} as const satisfies Record<NftNetwork, string>

export const catalogOptions = {
  categoryLabels,
  networkLabels,
  sortOptions,
  tabs,
}
