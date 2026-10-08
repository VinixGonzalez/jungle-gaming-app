import type { ComponentProps } from "react"

import type { SiteFooter, SiteHeader } from "@/shared/components/layout"
import {
  useBackNavigation,
  useMediaQuery,
  usePageTitle,
} from "@/shared/hooks"

import { useCartController } from "../hooks/use-cart-controller"
import { CartErrorState } from "./cart-error-state"
import { CartLoadingState } from "./cart-loading-state"
import { DesktopCart } from "./desktop-cart"
import { EmptyCartState } from "./empty-cart-state"
import { MobileCart } from "./mobile-cart"

interface CartPageProps {
  headerConfig: Omit<ComponentProps<typeof SiteHeader>, "className">
  footerConfig: Omit<ComponentProps<typeof SiteFooter>, "className">
  onCheckout: () => void
}

export function CartPage({
  headerConfig,
  footerConfig,
  onCheckout,
}: CartPageProps) {
  const isDesktop = useMediaQuery("(min-width: 1280px)")
  const controller = useCartController()
  const returnToPreviousPage = useBackNavigation()

  usePageTitle("Carrinho | Kurio")

  const resolvedHeaderConfig = {
    ...headerConfig,
    cart: { ...headerConfig.cart, count: controller.cartCount },
  }

  if (controller.status === "loading") {
    return (
      <CartLoadingState
        headerConfig={resolvedHeaderConfig}
        isDesktop={isDesktop}
      />
    )
  }

  if (controller.status === "error") {
    return (
      <CartErrorState
        headerConfig={resolvedHeaderConfig}
        isDesktop={isDesktop}
        onBack={returnToPreviousPage}
        onRetry={controller.retry}
      />
    )
  }

  if (controller.status === "empty") {
    return (
      <EmptyCartState
        feedback={controller.feedback}
        footerConfig={footerConfig}
        headerConfig={resolvedHeaderConfig}
        isDesktop={isDesktop}
        onBack={returnToPreviousPage}
      />
    )
  }

  const viewProps = {
    cart: controller.cart,
    feedback: controller.feedback,
    isUpdating: controller.isUpdating,
    onApplyCoupon: controller.applyCoupon,
    onCheckout,
    onQuantityChange: controller.changeQuantity,
    onRemove: controller.removeItem,
    onRemoveCoupon: controller.removeCoupon,
    pendingItemId: controller.pendingItemId,
  }

  if (isDesktop) {
    return (
      <DesktopCart
        {...viewProps}
        footerConfig={footerConfig}
        headerConfig={resolvedHeaderConfig}
      />
    )
  }

  return <MobileCart {...viewProps} onBack={returnToPreviousPage} />
}
