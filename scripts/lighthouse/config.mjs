export default {
  baseUrl: "http://127.0.0.1:4174",
  categories: ["performance", "accessibility", "best-practices", "seo"],
  pages: [
    { id: "home", path: "/", label: "Home" },
    {
      id: "nft-detail",
      path: "/nfts/genesis-circuit-014",
      label: "Detalhe do NFT",
    },
  ],
  profiles: [
    { id: "mobile", label: "Mobile", preset: null },
    { id: "desktop", label: "Desktop", preset: "desktop" },
  ],
  reportsDirectory: "lighthouse-reports",
  runs: 3,
  thresholds: {
    accessibility: 0.95,
    "best-practices": 0.95,
    performance: 0.95,
    seo: 0.95,
  },
}
