import type { ComponentProps } from "react"

import favoritesIcon from "@/shared/assets/icons/navigation/favorites.svg"
import homeIcon from "@/shared/assets/icons/navigation/home.svg"
import marketIcon from "@/shared/assets/icons/navigation/market.svg"
import type { MobileBottomNavigation } from "@/shared/components/layout"

export const mobileNavigationConfig = {
  items: [
    { label: "Início", href: "#inicio", iconSrc: homeIcon },
    { label: "Favoritos", href: "/favorites", iconSrc: favoritesIcon },
    { label: "Mercado", href: "#catalogo", iconSrc: marketIcon },
  ],
  scanAction: { label: "Escanear código" },
} satisfies Omit<
  ComponentProps<typeof MobileBottomNavigation>,
  "accountAction" | "className"
>
