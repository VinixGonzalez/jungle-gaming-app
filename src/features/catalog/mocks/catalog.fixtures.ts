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

import { catalogArtworks } from "../assets/catalog-artworks"
import type {
  Nft,
  NftAttribute,
  NftCollection,
  NftContract,
  NftCreator,
  NftDetailItem,
  NftNetwork,
  NftRating,
} from "../api/catalog.schemas"
import { catalogFixtureSlugs } from "./catalog-fixture-slugs"

const catalogFixtureDate = "2026-10-06T12:00:00.000Z"

const collections = {
  genesis: {
    id: "collection_genesis",
    slug: "genesis-circuit",
    name: "Genesis Circuit",
  },
  stillness: {
    id: "collection_stillness",
    slug: "studies-in-stillness",
    name: "Studies in Stillness",
  },
  frequencies: {
    id: "collection_frequencies",
    slug: "rare-frequencies",
    name: "Rare Frequencies",
  },
  worlds: {
    id: "collection_worlds",
    slug: "playable-worlds",
    name: "Playable Worlds",
  },
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
  spectra: {
    id: "collection_spectra",
    slug: "resonant-fields",
    name: "Resonant Fields",
  },
  relics: {
    id: "collection_relics",
    slug: "impossible-relics",
    name: "Impossible Relics",
  },
  frontier: {
    id: "collection_frontier",
    slug: "riftbound-chronicles",
    name: "Riftbound Chronicles",
  },
  reveries: {
    id: "collection_reveries",
    slug: "material-dreams",
    name: "Material Dreams",
  },
} satisfies Record<string, NftCollection>

const rawCatalogFixtures = [
  {
    id: "nft_genesis_014",
    slug: catalogFixtureSlugs.genesisCircuit,
    tokenId: "14",
    name: "Genesis Circuit #014",
    description: "A generative study of light moving through a modular circuit.",
    category: "generative-art",
    network: "ethereum",
    collection: collections.genesis,
    imageUrl: emeraldApeArtwork,
    thumbnailUrl: emeraldApeArtworkMobile,
    listedAt: "2026-09-29T14:00:00.000Z",
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
  },
  {
    id: "nft_quiet_orbit_028",
    slug: catalogFixtureSlugs.quietOrbit,
    tokenId: "28",
    name: "Quiet Orbit #028",
    description: "A photographic composition about scale, silence, and distance.",
    category: "photography",
    network: "polygon",
    collection: collections.stillness,
    imageUrl: sageNomadArtwork,
    thumbnailUrl: sageNomadArtworkMobile,
    listedAt: "2026-10-02T09:30:00.000Z",
    trendingScore: 67,
    isFeatured: false,
    editions: [
      {
        id: "edition_quiet_orbit_028",
        totalSupply: 10,
        availableQuantity: 6,
        priceEth: "0.31",
      },
    ],
    version: 1,
  },
  {
    id: "nft_signal_bloom_007",
    slug: catalogFixtureSlugs.signalBloom,
    tokenId: "7",
    name: "Signal Bloom #007",
    description: "An audiovisual collectible built from layered field recordings.",
    category: "music",
    network: "ethereum",
    collection: collections.frequencies,
    imageUrl: goldenBeatArtwork,
    thumbnailUrl: goldenBeatArtworkMobile,
    listedAt: "2026-10-05T18:15:00.000Z",
    trendingScore: 88,
    isFeatured: false,
    editions: [
      {
        id: "edition_signal_bloom_007",
        totalSupply: 25,
        availableQuantity: 12,
        priceEth: "0.18",
      },
    ],
    version: 2,
  },
  {
    id: "nft_rift_runner_103",
    slug: catalogFixtureSlugs.riftRunner,
    tokenId: "103",
    name: "Rift Runner #103",
    description: "A playable character collectible with a fixed edition supply.",
    category: "gaming",
    network: "solana",
    collection: collections.worlds,
    imageUrl: ivoryBaronArtwork,
    thumbnailUrl: ivoryBaronArtworkMobile,
    listedAt: "2026-09-21T11:45:00.000Z",
    trendingScore: 73,
    isFeatured: false,
    editions: [
      {
        id: "edition_rift_runner_103",
        totalSupply: 50,
        availableQuantity: 0,
        priceEth: "0.12",
      },
    ],
    version: 3,
  },
  {
    id: "nft_afterimage_041",
    slug: catalogFixtureSlugs.afterimage,
    tokenId: "41",
    name: "Afterimage #041",
    description: "A digital painting exploring memory through repeated silhouettes.",
    category: "digital-art",
    network: "ethereum",
    collection: collections.stillness,
    imageUrl: sageNomadArtwork,
    thumbnailUrl: sageNomadArtworkMobile,
    listedAt: "2026-08-18T16:20:00.000Z",
    trendingScore: 51,
    isFeatured: false,
    editions: [
      {
        id: "edition_afterimage_041",
        totalSupply: 5,
        availableQuantity: 2,
        priceEth: "0.56",
      },
    ],
    version: 1,
  },
  {
    id: "nft_vector_relic_022",
    slug: catalogFixtureSlugs.vectorRelic,
    tokenId: "22",
    name: "Vector Relic #022",
    description: "A limited digital object assembled from archival vector forms.",
    category: "collectibles",
    network: "polygon",
    collection: collections.genesis,
    imageUrl: emeraldApeArtwork,
    thumbnailUrl: emeraldApeArtworkMobile,
    listedAt: "2026-09-25T08:10:00.000Z",
    trendingScore: 46,
    isFeatured: false,
    editions: [
      {
        id: "edition_vector_relic_022",
        totalSupply: 20,
        availableQuantity: 14,
        priceEth: "0.09",
      },
    ],
    version: 1,
  },
  {
    id: "nft_resonance_064",
    slug: catalogFixtureSlugs.resonance,
    tokenId: "64",
    name: "Resonance #064",
    description: "A short-form sound piece paired with a procedural visual score.",
    category: "music",
    network: "solana",
    collection: collections.frequencies,
    imageUrl: goldenBeatArtwork,
    thumbnailUrl: goldenBeatArtworkMobile,
    listedAt: "2026-10-01T20:00:00.000Z",
    trendingScore: 79,
    isFeatured: false,
    editions: [
      {
        id: "edition_resonance_064",
        totalSupply: 12,
        availableQuantity: 7,
        priceEth: "0.27",
      },
    ],
    version: 1,
  },
  {
    id: "nft_threshold_009",
    slug: catalogFixtureSlugs.threshold,
    tokenId: "9",
    name: "Threshold #009",
    description: "An architectural photograph focused on shadow and negative space.",
    category: "photography",
    network: "ethereum",
    collection: collections.stillness,
    imageUrl: ivoryBaronArtwork,
    thumbnailUrl: ivoryBaronArtworkMobile,
    listedAt: "2026-08-14T13:05:00.000Z",
    trendingScore: 34,
    isFeatured: false,
    editions: [
      {
        id: "edition_threshold_009",
        totalSupply: 8,
        availableQuantity: 5,
        priceEth: "0.42",
      },
    ],
    version: 1,
  },
  {
    id: "nft_parallel_garden_117",
    slug: catalogFixtureSlugs.parallelGarden,
    tokenId: "117",
    name: "Parallel Garden #117",
    description: "A generative landscape created from a deterministic seed.",
    category: "generative-art",
    network: "polygon",
    collection: collections.genesis,
    imageUrl: emeraldApeArtwork,
    thumbnailUrl: emeraldApeArtworkMobile,
    listedAt: "2026-10-04T10:40:00.000Z",
    trendingScore: 84,
    isFeatured: false,
    editions: [
      {
        id: "edition_parallel_garden_117",
        totalSupply: 30,
        availableQuantity: 21,
        priceEth: "0.15",
      },
    ],
    version: 2,
  },
  {
    id: "nft_archive_key_003",
    slug: catalogFixtureSlugs.archiveKey,
    tokenId: "3",
    name: "Archive Key #003",
    description: "A collectible key granting access to a fictional on-chain archive.",
    category: "collectibles",
    network: "ethereum",
    collection: collections.worlds,
    imageUrl: ivoryBaronArtwork,
    thumbnailUrl: ivoryBaronArtworkMobile,
    listedAt: "2026-07-11T07:55:00.000Z",
    trendingScore: 61,
    isFeatured: false,
    editions: [
      {
        id: "edition_archive_key_003",
        totalSupply: 100,
        availableQuantity: 44,
        priceEth: "0.06",
      },
    ],
    version: 1,
  },
  {
    id: "nft_prism_tides_201",
    slug: catalogFixtureSlugs.prismTides,
    tokenId: "201",
    name: "Prism Tides #201",
    description: "Spectral ribbons fold into a precise generative vortex.",
    category: "generative-art",
    network: "ethereum",
    collection: collections.algorithms,
    imageUrl: catalogArtworks.prismTides.image,
    thumbnailUrl: catalogArtworks.prismTides.thumbnail,
    listedAt: "2026-10-05T16:20:00.000Z",
    trendingScore: 95,
    isFeatured: false,
    editions: [
      {
        id: "edition_prism_tides_201",
        totalSupply: 3,
        availableQuantity: 2,
        priceEth: "1.24",
      },
    ],
    version: 1,
  },
  {
    id: "nft_recursive_bloom_082",
    slug: catalogFixtureSlugs.recursiveBloom,
    tokenId: "82",
    name: "Recursive Bloom #082",
    description: "A botanical form unfolds from repeating mathematical petals.",
    category: "generative-art",
    network: "polygon",
    collection: collections.algorithms,
    imageUrl: catalogArtworks.recursiveBloom.image,
    thumbnailUrl: catalogArtworks.recursiveBloom.thumbnail,
    listedAt: "2026-10-03T15:10:00.000Z",
    trendingScore: 86,
    isFeatured: false,
    editions: [
      {
        id: "edition_recursive_bloom_082",
        totalSupply: 12,
        availableQuantity: 8,
        priceEth: "0.38",
      },
    ],
    version: 1,
  },
  {
    id: "nft_chromatic_fault_144",
    slug: catalogFixtureSlugs.chromaticFault,
    tokenId: "144",
    name: "Chromatic Fault #144",
    description: "Tectonic planes split into calibrated bands of colored light.",
    category: "generative-art",
    network: "solana",
    collection: collections.algorithms,
    imageUrl: catalogArtworks.chromaticFault.image,
    thumbnailUrl: catalogArtworks.chromaticFault.thumbnail,
    listedAt: "2026-09-28T19:40:00.000Z",
    trendingScore: 78,
    isFeatured: false,
    editions: [
      {
        id: "edition_chromatic_fault_144",
        totalSupply: 25,
        availableQuantity: 17,
        priceEth: "0.72",
      },
    ],
    version: 1,
  },
  {
    id: "nft_lattice_dawn_031",
    slug: catalogFixtureSlugs.latticeDawn,
    tokenId: "31",
    name: "Lattice Dawn #031",
    description: "A parametric lattice opens toward a synthetic sunrise.",
    category: "generative-art",
    network: "ethereum",
    collection: collections.algorithms,
    imageUrl: catalogArtworks.latticeDawn.image,
    thumbnailUrl: catalogArtworks.latticeDawn.thumbnail,
    listedAt: "2026-08-22T06:45:00.000Z",
    trendingScore: 64,
    isFeatured: false,
    editions: [
      {
        id: "edition_lattice_dawn_031",
        totalSupply: 50,
        availableQuantity: 32,
        priceEth: "0.11",
      },
    ],
    version: 1,
  },
  {
    id: "nft_lunar_brutalism_019",
    slug: catalogFixtureSlugs.lunarBrutalism,
    tokenId: "19",
    name: "Lunar Brutalism #019",
    description: "A monumental observatory stands alone beneath the moon.",
    category: "photography",
    network: "ethereum",
    collection: collections.exposures,
    imageUrl: catalogArtworks.lunarBrutalism.image,
    thumbnailUrl: catalogArtworks.lunarBrutalism.thumbnail,
    listedAt: "2026-10-05T07:25:00.000Z",
    trendingScore: 91,
    isFeatured: false,
    editions: [
      {
        id: "edition_lunar_brutalism_019",
        totalSupply: 5,
        availableQuantity: 1,
        priceEth: "1.85",
      },
    ],
    version: 1,
  },
  {
    id: "nft_desert_radio_052",
    slug: catalogFixtureSlugs.desertRadio,
    tokenId: "52",
    name: "Desert Radio #052",
    description: "A silent receiver waits among wind-shaped desert dunes.",
    category: "photography",
    network: "polygon",
    collection: collections.exposures,
    imageUrl: catalogArtworks.desertRadio.image,
    thumbnailUrl: catalogArtworks.desertRadio.thumbnail,
    listedAt: "2026-09-16T12:35:00.000Z",
    trendingScore: 58,
    isFeatured: false,
    editions: [
      {
        id: "edition_desert_radio_052",
        totalSupply: 20,
        availableQuantity: 13,
        priceEth: "0.22",
      },
    ],
    version: 1,
  },
  {
    id: "nft_rain_archive_088",
    slug: catalogFixtureSlugs.rainArchive,
    tokenId: "88",
    name: "Rain Archive #088",
    description: "Umbrellas and neon dissolve into reflections on wet stone.",
    category: "photography",
    network: "solana",
    collection: collections.exposures,
    imageUrl: catalogArtworks.rainArchive.image,
    thumbnailUrl: catalogArtworks.rainArchive.thumbnail,
    listedAt: "2026-07-29T21:05:00.000Z",
    trendingScore: 82,
    isFeatured: false,
    editions: [
      {
        id: "edition_rain_archive_088",
        totalSupply: 10,
        availableQuantity: 4,
        priceEth: "0.47",
      },
    ],
    version: 1,
  },
  {
    id: "nft_velvet_frequency_013",
    slug: catalogFixtureSlugs.velvetFrequency,
    tokenId: "13",
    name: "Velvet Frequency #013",
    description: "A soft waveform becomes a tactile fold of suspended velvet.",
    category: "music",
    network: "ethereum",
    collection: collections.spectra,
    imageUrl: catalogArtworks.velvetFrequency.image,
    thumbnailUrl: catalogArtworks.velvetFrequency.thumbnail,
    listedAt: "2026-10-05T12:15:00.000Z",
    trendingScore: 89,
    isFeatured: false,
    editions: [
      {
        id: "edition_velvet_frequency_013",
        totalSupply: 15,
        availableQuantity: 9,
        priceEth: "0.33",
      },
    ],
    version: 1,
  },
  {
    id: "nft_pulse_orchard_076",
    slug: catalogFixtureSlugs.pulseOrchard,
    tokenId: "76",
    name: "Pulse Orchard #076",
    description: "Rhythmic sound nodes grow across an electronic orchard.",
    category: "music",
    network: "polygon",
    collection: collections.spectra,
    imageUrl: catalogArtworks.pulseOrchard.image,
    thumbnailUrl: catalogArtworks.pulseOrchard.thumbnail,
    listedAt: "2026-09-30T17:50:00.000Z",
    trendingScore: 75,
    isFeatured: false,
    editions: [
      {
        id: "edition_pulse_orchard_076",
        totalSupply: 30,
        availableQuantity: 21,
        priceEth: "0.14",
      },
    ],
    version: 1,
  },
  {
    id: "nft_static_choir_109",
    slug: catalogFixtureSlugs.staticChoir,
    tokenId: "109",
    name: "Static Choir #109",
    description: "Fine radio-noise strands converge into a harmonic signal.",
    category: "music",
    network: "solana",
    collection: collections.spectra,
    imageUrl: catalogArtworks.staticChoir.image,
    thumbnailUrl: catalogArtworks.staticChoir.thumbnail,
    listedAt: "2026-08-30T23:10:00.000Z",
    trendingScore: 69,
    isFeatured: false,
    editions: [
      {
        id: "edition_static_choir_109",
        totalSupply: 8,
        availableQuantity: 0,
        priceEth: "0.66",
      },
    ],
    version: 1,
  },
  {
    id: "nft_obsidian_totem_005",
    slug: catalogFixtureSlugs.obsidianTotem,
    tokenId: "5",
    name: "Obsidian Totem #005",
    description: "A singular fictional relic carved from volcanic glass.",
    category: "collectibles",
    network: "ethereum",
    collection: collections.relics,
    imageUrl: catalogArtworks.obsidianTotem.image,
    thumbnailUrl: catalogArtworks.obsidianTotem.thumbnail,
    listedAt: "2026-09-26T14:30:00.000Z",
    trendingScore: 93,
    isFeatured: false,
    editions: [
      {
        id: "edition_obsidian_totem_005",
        totalSupply: 1,
        availableQuantity: 1,
        priceEth: "2.35",
      },
    ],
    version: 1,
  },
  {
    id: "nft_coral_cipher_044",
    slug: catalogFixtureSlugs.coralCipher,
    tokenId: "44",
    name: "Coral Cipher #044",
    description: "An intricate key-like artifact grown from coral geometry.",
    category: "collectibles",
    network: "polygon",
    collection: collections.relics,
    imageUrl: catalogArtworks.coralCipher.image,
    thumbnailUrl: catalogArtworks.coralCipher.thumbnail,
    listedAt: "2026-10-01T10:20:00.000Z",
    trendingScore: 72,
    isFeatured: false,
    editions: [
      {
        id: "edition_coral_cipher_044",
        totalSupply: 40,
        availableQuantity: 26,
        priceEth: "0.08",
      },
    ],
    version: 1,
  },
  {
    id: "nft_astral_compass_027",
    slug: catalogFixtureSlugs.astralCompass,
    tokenId: "27",
    name: "Astral Compass #027",
    description: "A concentric instrument charts a fictional field of stars.",
    category: "collectibles",
    network: "solana",
    collection: collections.relics,
    imageUrl: catalogArtworks.astralCompass.image,
    thumbnailUrl: catalogArtworks.astralCompass.thumbnail,
    listedAt: "2026-07-18T05:40:00.000Z",
    trendingScore: 81,
    isFeatured: false,
    editions: [
      {
        id: "edition_astral_compass_027",
        totalSupply: 7,
        availableQuantity: 3,
        priceEth: "0.95",
      },
    ],
    version: 1,
  },
  {
    id: "nft_ember_vanguard_211",
    slug: catalogFixtureSlugs.emberVanguard,
    tokenId: "211",
    name: "Ember Vanguard #211",
    description: "A playable explorer carries contained energy through the rift.",
    category: "gaming",
    network: "ethereum",
    collection: collections.frontier,
    imageUrl: catalogArtworks.emberVanguard.image,
    thumbnailUrl: catalogArtworks.emberVanguard.thumbnail,
    listedAt: "2026-10-04T16:55:00.000Z",
    trendingScore: 87,
    isFeatured: false,
    editions: [
      {
        id: "edition_ember_vanguard_211",
        totalSupply: 24,
        availableQuantity: 12,
        priceEth: "0.52",
      },
    ],
    version: 1,
  },
  {
    id: "nft_neon_warden_036",
    slug: catalogFixtureSlugs.neonWarden,
    tokenId: "36",
    name: "Neon Warden #036",
    description: "A modular guardian protects the gate between playable worlds.",
    category: "gaming",
    network: "polygon",
    collection: collections.frontier,
    imageUrl: catalogArtworks.neonWarden.image,
    thumbnailUrl: catalogArtworks.neonWarden.thumbnail,
    listedAt: "2026-09-19T20:25:00.000Z",
    trendingScore: 84,
    isFeatured: false,
    editions: [
      {
        id: "edition_neon_warden_036",
        totalSupply: 10,
        availableQuantity: 6,
        priceEth: "1.10",
      },
    ],
    version: 1,
  },
  {
    id: "nft_void_cartographer_090",
    slug: catalogFixtureSlugs.voidCartographer,
    tokenId: "90",
    name: "Void Cartographer #090",
    description: "A cosmic navigator maps unstable dimensions for future quests.",
    category: "gaming",
    network: "solana",
    collection: collections.frontier,
    imageUrl: catalogArtworks.voidCartographer.image,
    thumbnailUrl: catalogArtworks.voidCartographer.thumbnail,
    listedAt: "2026-08-09T09:35:00.000Z",
    trendingScore: 76,
    isFeatured: false,
    editions: [
      {
        id: "edition_void_cartographer_090",
        totalSupply: 18,
        availableQuantity: 5,
        priceEth: "0.29",
      },
    ],
    version: 1,
  },
  {
    id: "nft_glass_reverie_063",
    slug: catalogFixtureSlugs.glassReverie,
    tokenId: "63",
    name: "Glass Reverie #063",
    description: "A dreamlike silhouette is assembled from translucent planes.",
    category: "digital-art",
    network: "ethereum",
    collection: collections.reveries,
    imageUrl: catalogArtworks.glassReverie.image,
    thumbnailUrl: catalogArtworks.glassReverie.thumbnail,
    listedAt: "2026-10-02T13:45:00.000Z",
    trendingScore: 80,
    isFeatured: false,
    editions: [
      {
        id: "edition_glass_reverie_063",
        totalSupply: 9,
        availableQuantity: 7,
        priceEth: "0.41",
      },
    ],
    version: 1,
  },
  {
    id: "nft_copper_dreams_121",
    slug: catalogFixtureSlugs.copperDreams,
    tokenId: "121",
    name: "Copper Dreams #121",
    description: "An impossible city folds itself from thin copper sheets.",
    category: "digital-art",
    network: "polygon",
    collection: collections.reveries,
    imageUrl: catalogArtworks.copperDreams.image,
    thumbnailUrl: catalogArtworks.copperDreams.thumbnail,
    listedAt: "2026-09-24T18:00:00.000Z",
    trendingScore: 68,
    isFeatured: false,
    editions: [
      {
        id: "edition_copper_dreams_121",
        totalSupply: 16,
        availableQuantity: 10,
        priceEth: "0.19",
      },
    ],
    version: 1,
  },
  {
    id: "nft_midnight_habitat_017",
    slug: catalogFixtureSlugs.midnightHabitat,
    tokenId: "17",
    name: "Midnight Habitat #017",
    description: "A compact floating ecosystem glows in the midnight void.",
    category: "digital-art",
    network: "solana",
    collection: collections.reveries,
    imageUrl: catalogArtworks.midnightHabitat.image,
    thumbnailUrl: catalogArtworks.midnightHabitat.thumbnail,
    listedAt: "2026-09-12T02:15:00.000Z",
    trendingScore: 90,
    isFeatured: false,
    editions: [
      {
        id: "edition_midnight_habitat_017",
        totalSupply: 6,
        availableQuantity: 2,
        priceEth: "0.59",
      },
    ],
    version: 1,
  },
  {
    id: "nft_celestial_mask_101",
    slug: catalogFixtureSlugs.celestialMask,
    tokenId: "101",
    name: "Celestial Mask #101",
    description: "A porcelain mask traces an abstract system of orbital rings.",
    category: "digital-art",
    network: "polygon",
    collection: collections.reveries,
    imageUrl: catalogArtworks.celestialMask.image,
    thumbnailUrl: catalogArtworks.celestialMask.thumbnail,
    listedAt: "2026-06-28T11:30:00.000Z",
    trendingScore: 74,
    isFeatured: false,
    editions: [
      {
        id: "edition_celestial_mask_101",
        totalSupply: 2,
        availableQuantity: 1,
        priceEth: "1.48",
      },
    ],
    version: 1,
  },
] satisfies Nft[]

const catalogFixtures: readonly Nft[] = rawCatalogFixtures

const creatorsByCollectionId: Partial<Record<string, NftCreator>> = {
  collection_genesis: {
    id: "creator_maya-chen",
    name: "Maya Chen",
  },
  collection_stillness: {
    id: "creator_noah-williams",
    name: "Noah Williams",
  },
  collection_frequencies: {
    id: "creator_lina-ortiz",
    name: "Lina Ortiz",
  },
  collection_worlds: {
    id: "creator_ren-ito",
    name: "Ren Ito",
  },
  collection_algorithms: {
    id: "creator_amara-nwosu",
    name: "Amara Nwosu",
  },
  collection_exposures: {
    id: "creator_theo-marin",
    name: "Theo Marin",
  },
  collection_spectra: {
    id: "creator_inez-vale",
    name: "Inez Vale",
  },
  collection_relics: {
    id: "creator_sora-bell",
    name: "Sora Bell",
  },
  collection_frontier: {
    id: "creator_kael-moreno",
    name: "Kael Moreno",
  },
  collection_reveries: {
    id: "creator_aya-laurent",
    name: "Aya Laurent",
  },
}

const contractsByNetwork = {
  ethereum: {
    address: "0x4a1f06c5f8b90df6d7d00ce9abf8d38e5da93417",
    standard: "ERC-721",
  },
  polygon: {
    address: "0x9c72dc8f5e14bea6f31b7d22647891c048749a22",
    standard: "ERC-1155",
  },
  solana: {
    address: "6YwTqBdL49ZVhs81JuK3rGTXQQLBmXYaFzZqch9hRqJc",
    standard: "Metaplex",
  },
} satisfies Record<NftNetwork, NftContract>

const categoryLabels = {
  "digital-art": "Digital art",
  photography: "Photography",
  music: "Music",
  collectibles: "Collectible",
  "generative-art": "Generative art",
  gaming: "Gaming",
} as const

interface NftDetailMetadata {
  detailImageUrl?: string
  rating: NftRating
}

const detailMetadataById: Partial<Record<string, NftDetailMetadata>> = {
  nft_genesis_014: {
    detailImageUrl: emeraldApeArtworkMobile,
    rating: { average: 4.9, reviewCount: 128 },
  },
  nft_quiet_orbit_028: {
    detailImageUrl: sageNomadArtworkMobile,
    rating: { average: 4.7, reviewCount: 54 },
  },
  nft_signal_bloom_007: {
    detailImageUrl: goldenBeatArtworkMobile,
    rating: { average: 4.8, reviewCount: 96 },
  },
  nft_rift_runner_103: {
    detailImageUrl: ivoryBaronArtworkMobile,
    rating: { average: 4.6, reviewCount: 71 },
  },
  nft_afterimage_041: {
    detailImageUrl: sageNomadArtworkMobile,
    rating: { average: 4.5, reviewCount: 32 },
  },
  nft_vector_relic_022: {
    detailImageUrl: emeraldApeArtworkMobile,
    rating: { average: 4.4, reviewCount: 45 },
  },
  nft_resonance_064: {
    detailImageUrl: goldenBeatArtworkMobile,
    rating: { average: 4.8, reviewCount: 83 },
  },
  nft_threshold_009: {
    detailImageUrl: ivoryBaronArtworkMobile,
    rating: { average: 4.6, reviewCount: 38 },
  },
  nft_parallel_garden_117: {
    detailImageUrl: emeraldApeArtworkMobile,
    rating: { average: 4.9, reviewCount: 112 },
  },
  nft_archive_key_003: {
    detailImageUrl: ivoryBaronArtworkMobile,
    rating: { average: 4.7, reviewCount: 67 },
  },
  nft_prism_tides_201: {
    rating: { average: 4.9, reviewCount: 143 },
  },
  nft_recursive_bloom_082: {
    rating: { average: 4.8, reviewCount: 87 },
  },
  nft_chromatic_fault_144: {
    rating: { average: 4.7, reviewCount: 64 },
  },
  nft_lattice_dawn_031: {
    rating: { average: 4.5, reviewCount: 39 },
  },
  nft_lunar_brutalism_019: {
    rating: { average: 4.9, reviewCount: 118 },
  },
  nft_desert_radio_052: {
    rating: { average: 4.6, reviewCount: 52 },
  },
  nft_rain_archive_088: {
    rating: { average: 4.8, reviewCount: 91 },
  },
  nft_velvet_frequency_013: {
    rating: { average: 4.8, reviewCount: 104 },
  },
  nft_pulse_orchard_076: {
    rating: { average: 4.6, reviewCount: 73 },
  },
  nft_static_choir_109: {
    rating: { average: 4.4, reviewCount: 35 },
  },
  nft_obsidian_totem_005: {
    rating: { average: 5, reviewCount: 42 },
  },
  nft_coral_cipher_044: {
    rating: { average: 4.5, reviewCount: 61 },
  },
  nft_astral_compass_027: {
    rating: { average: 4.8, reviewCount: 79 },
  },
  nft_ember_vanguard_211: {
    rating: { average: 4.7, reviewCount: 96 },
  },
  nft_neon_warden_036: {
    rating: { average: 4.8, reviewCount: 111 },
  },
  nft_void_cartographer_090: {
    rating: { average: 4.6, reviewCount: 68 },
  },
  nft_glass_reverie_063: {
    rating: { average: 4.7, reviewCount: 84 },
  },
  nft_copper_dreams_121: {
    rating: { average: 4.5, reviewCount: 57 },
  },
  nft_midnight_habitat_017: {
    rating: { average: 4.9, reviewCount: 126 },
  },
  nft_celestial_mask_101: {
    rating: { average: 4.8, reviewCount: 93 },
  },
}

function createAttributes(nft: Nft): NftAttribute[] {
  return [
    { traitType: "Category", value: categoryLabels[nft.category] },
    { traitType: "Collection", value: nft.collection.name },
    { traitType: "Token ID", value: nft.tokenId },
  ]
}

const nftDetailFixtures: readonly NftDetailItem[] = catalogFixtures.map(
  (nft) => {
    const metadata = detailMetadataById[nft.id]
    const creator = creatorsByCollectionId[nft.collection.id]

    if (!metadata || !creator) {
      throw new Error(`Missing detail fixture metadata for ${nft.id}`)
    }

    const detailImageUrl = metadata.detailImageUrl

    return {
      ...nft,
      gallery: [
        {
          id: `${nft.id}_primary`,
          imageUrl: nft.imageUrl,
          thumbnailUrl: nft.thumbnailUrl,
          alt: `Vista principal de ${nft.name}`,
        },
        ...(detailImageUrl
          ? [
              {
                id: `${nft.id}_detail`,
                imageUrl: detailImageUrl,
                thumbnailUrl: nft.imageUrl,
                alt: `Composição completa de ${nft.name}`,
              },
            ]
          : []),
      ],
      attributes: createAttributes(nft),
      rating: metadata.rating,
      creator,
      contract: contractsByNetwork[nft.network],
    }
  },
)

export const catalogFixtureData = {
  date: catalogFixtureDate,
  detailItems: nftDetailFixtures,
  items: catalogFixtures,
}
