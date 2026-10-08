import { Outlet, useLocation } from "@tanstack/react-router"

import { accountHeaderConfig } from "@/app/config"
import {
  AccountLayout,
  AccountMobileHeader,
} from "@/features/account"
import { useRequireSession } from "@/features/auth"
import { AccountNavigationAction } from "@/features/auth/account-navigation"
import { useCartQuery } from "@/features/cart"
import { SiteHeader } from "@/shared/components/layout"

export function AccountRoute() {
  const location = useLocation()
  const cart = useCartQuery()
  useRequireSession(location.href)

  const activeItem = location.pathname.startsWith("/wallets")
    ? "wallets"
    : location.pathname.startsWith("/favorites")
      ? "favorites"
      : "profile"
  const cartCount = cart.data?.totals.itemCount ?? 0
  const headerConfig = {
    ...accountHeaderConfig,
    accountAction: (
      <AccountNavigationAction
        returnTo={location.href}
        variant="desktop"
      />
    ),
    cart: { ...accountHeaderConfig.cart, count: cartCount },
  }

  return (
    <div className="min-h-svh bg-ink text-foreground">
      <div className="mx-auto hidden w-full max-w-content pt-page-top-desktop xl:block">
        <SiteHeader {...headerConfig} />
      </div>
      <AccountMobileHeader cartCount={cartCount} />
      <AccountLayout activeItem={activeItem}>
        <Outlet />
      </AccountLayout>
    </div>
  )
}
