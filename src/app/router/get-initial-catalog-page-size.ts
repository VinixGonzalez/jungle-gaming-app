export function getInitialCatalogPageSize() {
  if (window.matchMedia("(min-width: 1280px)").matches) return 9
  if (window.matchMedia("(min-width: 768px)").matches) return 6

  return 4
}
