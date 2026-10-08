import type { ReactNode } from "react"

import { AccountMobileNavigation } from "./account-mobile-navigation"
import { AccountSidebar } from "./account-sidebar"

interface AccountLayoutProps {
  activeItem: "favorites" | "profile" | "wallets"
  children: ReactNode
}

export function AccountLayout({
  activeItem,
  children,
}: AccountLayoutProps) {
  return (
    <main className="mx-auto w-full max-w-content px-page-mobile pt-6 pb-16 xl:flex xl:items-start xl:gap-7 xl:px-0 xl:pt-8">
      <AccountMobileNavigation activeItem={activeItem} />
      <AccountSidebar activeItem={activeItem} />
      <div className="min-w-0 flex-1">{children}</div>
    </main>
  )
}
