import { useLocation, useNavigate } from "@tanstack/react-router"

import {
  innerPageFooterConfig,
  marketHeaderConfig,
} from "@/app/config"
import { useRequireSession } from "@/features/auth"
import { AccountNavigationAction } from "@/features/auth/account-navigation"
import { useCartQuery } from "@/features/cart"
import { CheckoutPage } from "@/features/checkout"
import { ordersApi } from "@/features/orders"
import { SiteFooter, SiteHeader } from "@/shared/components/layout"

export function CheckoutRoute() {
  const location = useLocation()
  const navigate = useNavigate()
  const cart = useCartQuery()
  useRequireSession(location.href)

  const headerConfig = {
    ...marketHeaderConfig,
    accountAction: (
      <AccountNavigationAction
        returnTo={location.href}
        variant="desktop"
      />
    ),
    cart: {
      ...marketHeaderConfig.cart,
      count: cart.data?.totals.itemCount ?? 0,
    },
  }

  function returnToAuthentication() {
    void navigate({
      replace: true,
      search: { returnTo: "/checkout" },
      state: { authCanGoBack: false, authReturnTo: "/checkout" },
      to: "/login",
    })
  }

  return (
    <div className="min-h-svh bg-ink text-foreground">
      <div className="mx-auto hidden w-full max-w-content pt-page-top-desktop xl:block">
        <SiteHeader {...headerConfig} />
      </div>

      <CheckoutPage
        createOrder={ordersApi.create}
        onAuthenticationRequired={returnToAuthentication}
        onOrderCreated={(orderId) =>
          void navigate({
            params: { orderId },
            to: "/orders/$orderId",
          })
        }
      />

      <SiteFooter className="mt-16" {...innerPageFooterConfig} />
    </div>
  )
}
