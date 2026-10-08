import { useLocation, useNavigate, useParams } from "@tanstack/react-router"

import { marketHeaderConfig } from "@/app/config"
import { useRequireSession } from "@/features/auth"
import { AccountNavigationAction } from "@/features/auth/account-navigation"
import { useCartQuery } from "@/features/cart"
import { OrderResultPage } from "@/features/orders"

export function OrderRoute() {
  const { orderId } = useParams({ from: "/orders/$orderId" })
  const location = useLocation()
  const navigate = useNavigate()
  useRequireSession(location.href)
  const cart = useCartQuery()
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

  return (
    <OrderResultPage
      headerConfig={headerConfig}
      onBackToCart={() => void navigate({ to: "/cart" })}
      onClose={() => void navigate({ to: "/", hash: "catalogo" })}
      orderId={orderId}
    />
  )
}
