import type { ComponentProps } from "react"

import type { SiteFooter } from "@/shared/components/layout"

import { siteFooterConfig } from "./site-footer.config"

export const innerPageFooterConfig = {
  ...siteFooterConfig,
  brand: {
    ...siteFooterConfig.brand,
    href: "/#inicio",
  },
  columns: siteFooterConfig.columns.map((column) => ({
    ...column,
    links: column.links.map((link) => ({
      ...link,
      href: link.href.startsWith("#") ? `/${link.href}` : link.href,
    })),
  })),
} satisfies Omit<ComponentProps<typeof SiteFooter>, "className">
