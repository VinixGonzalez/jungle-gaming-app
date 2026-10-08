import { useLocation, useNavigate } from "@tanstack/react-router"

import {
  innerPageFooterConfig,
  marketHeaderConfig,
} from "@/app/config"
import { AccountNavigationAction } from "@/features/auth/account-navigation"
import { CartPage } from "@/features/cart"

export function CartRoute() {
  const location = useLocation()
  const navigate = useNavigate()
  const headerConfig = {
    ...marketHeaderConfig,
    accountAction: (
      <AccountNavigationAction
        returnTo={location.href}
        variant="desktop"
      />
    ),
  }

  return (
    <CartPage
      footerConfig={innerPageFooterConfig}
      headerConfig={headerConfig}
      onCheckout={() => void navigate({ href: "/checkout" })}
    />
  )
}
