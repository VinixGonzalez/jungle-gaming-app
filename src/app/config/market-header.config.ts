import type { ComponentProps } from "react"

import type { SiteHeader } from "@/shared/components/layout"

import { siteHeaderConfig } from "./site-header.config"

export const marketHeaderConfig = {
  ...siteHeaderConfig,
  brand: {
    ...siteHeaderConfig.brand,
    href: "/#inicio",
  },
  navigation: siteHeaderConfig.navigation.map((item) => ({
    ...item,
    href: `/${item.href}`,
    active: item.label === "Mercado",
  })),
  cart: { ...siteHeaderConfig.cart, href: "/cart" },
} satisfies Omit<
  ComponentProps<typeof SiteHeader>,
  "accountAction" | "className"
>
