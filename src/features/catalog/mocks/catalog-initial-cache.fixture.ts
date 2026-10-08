import emeraldApeArtwork from "@/shared/assets/artworks/emerald-ape.webp"
import emeraldApeArtworkMobile from "@/shared/assets/artworks/emerald-ape-mobile.webp"
import goldenBeatArtwork from "@/shared/assets/artworks/golden-beat.webp"
import goldenBeatArtworkMobile from "@/shared/assets/artworks/golden-beat-mobile.webp"
import sageNomadArtwork from "@/shared/assets/artworks/sage-nomad.webp"
import sageNomadArtworkMobile from "@/shared/assets/artworks/sage-nomad-mobile.webp"

import emberVanguardArtwork from "../assets/artworks/ember-vanguard.webp"
import emberVanguardArtworkMobile from "../assets/artworks/ember-vanguard-mobile.webp"
import glassReverieArtwork from "../assets/artworks/glass-reverie.webp"
import glassReverieArtworkMobile from "../assets/artworks/glass-reverie-mobile.webp"
import lunarBrutalismArtwork from "../assets/artworks/lunar-brutalism.webp"
import lunarBrutalismArtworkMobile from "../assets/artworks/lunar-brutalism-mobile.webp"
import prismTidesArtwork from "../assets/artworks/prism-tides.webp"
import prismTidesArtworkMobile from "../assets/artworks/prism-tides-mobile.webp"
import recursiveBloomArtwork from "../assets/artworks/recursive-bloom.webp"
import recursiveBloomArtworkMobile from "../assets/artworks/recursive-bloom-mobile.webp"
import velvetFrequencyArtwork from "../assets/artworks/velvet-frequency.webp"
import velvetFrequencyArtworkMobile from "../assets/artworks/velvet-frequency-mobile.webp"
import type {
  CatalogItem,
  CatalogResponse,
  NftDetailResponse,
} from "../api/catalog.schemas"
import { catalogFixtureSlugs } from "./catalog-fixture-slugs"

const collections = {
  algorithms: {
    id: "collection_algorithms",
    slug: "synthetic-nature",
    name: "Synthetic Nature",
  },
  exposures: {
    id: "collection_exposures",
    slug: "liminal-exposures",
    name: "Liminal Exposures",
  },
  frequencies: {
    id: "collection_frequencies",
    slug: "rare-frequencies",
    name: "Rare Frequencies",
  },
  frontier: {
    id: "collection_frontier",
    slug: "riftbound-chronicles",
    name: "Riftbound Chronicles",
  },
  genesis: {
    id: "collection_genesis",
    slug: "genesis-circuit",
    name: "Genesis Circuit",
  },
  reveries: {
    id: "collection_reveries",
    slug: "material-dreams",
    name: "Material Dreams",
  },
  spectra: {
    id: "collection_spectra",
    slug: "resonant-fields",
    name: "Resonant Fields",
  },
  stillness: {
    id: "collection_stillness",
    slug: "studies-in-stillness",
    name: "Studies in Stillness",
  },
} as const

const initialCatalogItems = [
  {
    id: "nft_signal_bloom_007",
    slug: catalogFixtureSlugs.signalBloom,
    name: "Signal Bloom #007",
    category: "music",
    network: "ethereum",
    collection: collections.frequencies,
    imageUrl: goldenBeatArtwork,
    thumbnailUrl: goldenBeatArtworkMobile,
    listedAt: "2026-10-05T18:15:00.000Z",
    isFeatured: false,
    version: 2,
    priceEth: "0.18",
    availableQuantity: 12,
  },
  {
    id: "nft_prism_tides_201",
    slug: catalogFixtureSlugs.prismTides,
    name: "Prism Tides #201",
    category: "generative-art",
    network: "ethereum",
    collection: collections.algorithms,
    imageUrl: prismTidesArtwork,
    thumbnailUrl: prismTidesArtworkMobile,
    listedAt: "2026-10-05T16:20:00.000Z",
    isFeatured: false,
    version: 1,
    priceEth: "1.24",
    availableQuantity: 2,
  },
  {
    id: "nft_velvet_frequency_013",
    slug: catalogFixtureSlugs.velvetFrequency,
    name: "Velvet Frequency #013",
    category: "music",
    network: "ethereum",
    collection: collections.spectra,
    imageUrl: velvetFrequencyArtwork,
    thumbnailUrl: velvetFrequencyArtworkMobile,
    listedAt: "2026-10-05T12:15:00.000Z",
    isFeatured: false,
    version: 1,
    priceEth: "0.33",
    availableQuantity: 9,
  },
  {
    id: "nft_lunar_brutalism_019",
    slug: catalogFixtureSlugs.lunarBrutalism,
    name: "Lunar Brutalism #019",
    category: "photography",
    network: "ethereum",
    collection: collections.exposures,
    imageUrl: lunarBrutalismArtwork,
    thumbnailUrl: lunarBrutalismArtworkMobile,
    listedAt: "2026-10-05T07:25:00.000Z",
    isFeatured: false,
    version: 1,
    priceEth: "1.85",
    availableQuantity: 1,
  },
  {
    id: "nft_ember_vanguard_211",
    slug: catalogFixtureSlugs.emberVanguard,
    name: "Ember Vanguard #211",
    category: "gaming",
    network: "ethereum",
    collection: collections.frontier,
    imageUrl: emberVanguardArtwork,
    thumbnailUrl: emberVanguardArtworkMobile,
    listedAt: "2026-10-04T16:55:00.000Z",
    isFeatured: false,
    version: 1,
    priceEth: "0.52",
    availableQuantity: 12,
  },
  {
    id: "nft_parallel_garden_117",
    slug: catalogFixtureSlugs.parallelGarden,
    name: "Parallel Garden #117",
    category: "generative-art",
    network: "polygon",
    collection: collections.genesis,
    imageUrl: emeraldApeArtwork,
    thumbnailUrl: emeraldApeArtworkMobile,
    listedAt: "2026-10-04T10:40:00.000Z",
    isFeatured: false,
    version: 2,
    priceEth: "0.15",
    availableQuantity: 21,
  },
  {
    id: "nft_recursive_bloom_082",
    slug: catalogFixtureSlugs.recursiveBloom,
    name: "Recursive Bloom #082",
    category: "generative-art",
    network: "polygon",
    collection: collections.algorithms,
    imageUrl: recursiveBloomArtwork,
    thumbnailUrl: recursiveBloomArtworkMobile,
    listedAt: "2026-10-03T15:10:00.000Z",
    isFeatured: false,
    version: 1,
    priceEth: "0.38",
    availableQuantity: 8,
  },
  {
    id: "nft_glass_reverie_063",
    slug: catalogFixtureSlugs.glassReverie,
    name: "Glass Reverie #063",
    category: "digital-art",
    network: "ethereum",
    collection: collections.reveries,
    imageUrl: glassReverieArtwork,
    thumbnailUrl: glassReverieArtworkMobile,
    listedAt: "2026-10-02T13:45:00.000Z",
    isFeatured: false,
    version: 1,
    priceEth: "0.41",
    availableQuantity: 7,
  },
  {
    id: "nft_quiet_orbit_028",
    slug: catalogFixtureSlugs.quietOrbit,
    name: "Quiet Orbit #028",
    category: "photography",
    network: "polygon",
    collection: collections.stillness,
    imageUrl: sageNomadArtwork,
    thumbnailUrl: sageNomadArtworkMobile,
    listedAt: "2026-10-02T09:30:00.000Z",
    isFeatured: false,
    version: 1,
    priceEth: "0.31",
    availableQuantity: 6,
  },
] satisfies CatalogItem[]

const featuredItem = {
  id: "nft_genesis_014",
  slug: catalogFixtureSlugs.genesisCircuit,
  name: "Genesis Circuit #014",
  category: "generative-art",
  network: "ethereum",
  collection: collections.genesis,
  imageUrl: emeraldApeArtwork,
  thumbnailUrl: emeraldApeArtworkMobile,
  listedAt: "2026-09-29T14:00:00.000Z",
  isFeatured: true,
  version: 1,
  priceEth: "0.84",
  availableQuantity: 7,
} satisfies CatalogItem

const facets: CatalogResponse["facets"] = {
  categories: [
    { value: "generative-art", count: 6 },
    { value: "photography", count: 5 },
    { value: "music", count: 5 },
    { value: "gaming", count: 4 },
    { value: "digital-art", count: 5 },
    { value: "collectibles", count: 5 },
  ],
  networks: [
    { value: "ethereum", count: 12 },
    { value: "polygon", count: 10 },
    { value: "solana", count: 8 },
  ],
  priceRange: { minEth: "0.06", maxEth: "2.35" },
}

const genesisDetail: NftDetailResponse = {
  item: {
    id: featuredItem.id,
    slug: featuredItem.slug,
    tokenId: "14",
    name: featuredItem.name,
    description:
      "A generative study of light moving through a modular circuit.",
    category: featuredItem.category,
    network: featuredItem.network,
    collection: featuredItem.collection,
    imageUrl: featuredItem.imageUrl,
    thumbnailUrl: featuredItem.thumbnailUrl,
    listedAt: featuredItem.listedAt,
    trendingScore: 92,
    isFeatured: true,
    editions: [
      {
        id: "edition_genesis_014_unique",
        totalSupply: 1,
        availableQuantity: 1,
        priceEth: "0.84",
      },
      {
        id: "edition_genesis_014_limited",
        totalSupply: 10,
        availableQuantity: 6,
        priceEth: "0.95",
      },
      {
        id: "edition_genesis_014_archived",
        totalSupply: 5,
        availableQuantity: 0,
        priceEth: "1.12",
      },
    ],
    version: 1,
    gallery: [
      {
        id: "nft_genesis_014_primary",
        imageUrl: emeraldApeArtwork,
        thumbnailUrl: emeraldApeArtworkMobile,
        alt: "Vista principal de Genesis Circuit #014",
      },
      {
        id: "nft_genesis_014_detail",
        imageUrl: emeraldApeArtworkMobile,
        thumbnailUrl: emeraldApeArtwork,
        alt: "Composição completa de Genesis Circuit #014",
      },
    ],
    attributes: [
      { traitType: "Category", value: "Generative art" },
      { traitType: "Collection", value: "Genesis Circuit" },
      { traitType: "Token ID", value: "14" },
    ],
    rating: { average: 4.9, reviewCount: 128 },
    creator: { id: "creator_maya-chen", name: "Maya Chen" },
    contract: {
      address: "0x4a1f06c5f8b90df6d7d00ce9abf8d38e5da93417",
      standard: "ERC-721",
    },
  },
  relatedItems: [
    {
      id: "nft_vector_relic_022",
      slug: catalogFixtureSlugs.vectorRelic,
      name: "Vector Relic #022",
      category: "collectibles",
      network: "polygon",
      collection: collections.genesis,
      imageUrl: emeraldApeArtwork,
      thumbnailUrl: emeraldApeArtworkMobile,
      listedAt: "2026-09-25T08:10:00.000Z",
      isFeatured: false,
      version: 1,
      priceEth: "0.09",
      availableQuantity: 14,
    },
    {
      id: "nft_parallel_garden_117",
      slug: catalogFixtureSlugs.parallelGarden,
      name: "Parallel Garden #117",
      category: "generative-art",
      network: "polygon",
      collection: collections.genesis,
      imageUrl: emeraldApeArtwork,
      thumbnailUrl: emeraldApeArtworkMobile,
      listedAt: "2026-10-04T10:40:00.000Z",
      isFeatured: false,
      version: 2,
      priceEth: "0.15",
      availableQuantity: 21,
    },
  ],
}

export const catalogInitialCacheFixture = {
  getCatalog(pageSize: number): CatalogResponse {
    return {
      items: initialCatalogItems.slice(0, pageSize),
      featuredItem,
      facets,
      pagination: {
        page: 1,
        pageSize,
        totalItems: 30,
        totalPages: Math.ceil(30 / pageSize),
      },
    }
  },
  findDetail(slug: string) {
    return slug === catalogFixtureSlugs.genesisCircuit
      ? genesisDetail
      : undefined
  },
}
