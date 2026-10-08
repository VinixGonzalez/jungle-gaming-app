import {
  useBackNavigation,
  useMediaQuery,
  usePageTitle,
} from "@/shared/hooks"

import type { CheckoutOrderCreator } from "../contracts"
import { useCheckoutController } from "../hooks/use-checkout-controller"
import { CheckoutReviewDialog } from "./checkout-review-dialog"
import { CheckoutState } from "./checkout-state"
import { DesktopCheckout } from "./desktop-checkout"
import { MobileCheckout } from "./mobile-checkout"

interface CheckoutPageProps {
  createOrder: CheckoutOrderCreator
  onAuthenticationRequired: () => void
  onOrderCreated: (orderId: string) => void
}

export function CheckoutPage({
  createOrder,
  onAuthenticationRequired,
  onOrderCreated,
}: CheckoutPageProps) {
  const isDesktop = useMediaQuery("(min-width: 1280px)")
  const onBack = useBackNavigation()
  const checkout = useCheckoutController({
    createOrder,
    onAuthenticationRequired,
    onOrderCreated,
  })

  usePageTitle("Pagamento | Kurio")

  if (checkout.status !== "ready") {
    return (
      <CheckoutState
        kind={checkout.status}
        message={checkout.status === "error" ? checkout.message : undefined}
        onBack={onBack}
        onRetry={checkout.retry}
      />
    )
  }

  return (
    <>
      {isDesktop ? (
        <DesktopCheckout checkout={checkout} />
      ) : (
        <MobileCheckout checkout={checkout} onBack={onBack} />
      )}
      <CheckoutReviewDialog checkout={checkout} />
    </>
  )
}
