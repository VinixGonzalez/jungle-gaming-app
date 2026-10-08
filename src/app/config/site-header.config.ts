import type { ComponentProps } from "react"

import type { SiteHeader } from "@/shared/components/layout"

export const siteHeaderConfig = {
  brand: {
    name: "KURIO",
    href: "#inicio",
    ariaLabel: "Kurio — página inicial",
  },
  navigation: [
    { label: "Início", href: "#inicio" },
    { label: "Mercado", href: "#catalogo" },
    { label: "Criadores", href: "#criadores" },
    { label: "Aprenda", href: "#aprenda" },
  ],
  search: { label: "Pesquisar" },
  cart: { href: "/cart", count: 0, label: "Carrinho" },
} satisfies Omit<
  ComponentProps<typeof SiteHeader>,
  "accountAction" | "className"
>
