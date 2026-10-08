export function preloadInitialRoute() {
  if (window.location.pathname.startsWith("/nfts/")) {
    return import("@/routes/nft-detail-route")
  }

  if (
    window.location.pathname === "/" ||
    window.location.pathname === "/login" ||
    window.location.pathname === "/register"
  ) {
    return import("@/routes/home-route")
  }

  return Promise.resolve()
}
