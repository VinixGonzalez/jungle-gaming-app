import type { ComponentProps } from "react"
import { ArrowLeft } from "lucide-react"

import type { SiteHeader } from "@/shared/components/layout"
import { SiteHeader as Header } from "@/shared/components/layout"
import { IconButton } from "@/shared/components/ui/icon-button"
import { useMediaQuery, usePageTitle } from "@/shared/hooks"

import { useOrderController } from "../hooks/use-order-controller"
import { OrderReceipt } from "./order-receipt"
import { OrderStatusView } from "./order-status-view"

interface OrderResultPageProps {
  headerConfig: Omit<ComponentProps<typeof SiteHeader>, "className">
  onBackToCart: () => void
  onClose: () => void
  orderId: string
}

export function OrderResultPage({
  headerConfig,
  onBackToCart,
  onClose,
  orderId,
}: OrderResultPageProps) {
  const isDesktop = useMediaQuery("(min-width: 1280px)")
  const controller = useOrderController(orderId)

  usePageTitle(
    controller.status === "confirmed"
      ? "Pedido confirmado | Kurio"
      : controller.status === "refused"
        ? "Pagamento recusado | Kurio"
        : "Acompanhar pedido | Kurio",
  )

  return (
    <div className="min-h-svh bg-ink text-foreground">
      {isDesktop ? (
        <div className="mx-auto w-full max-w-content pt-page-top-desktop">
          <Header {...headerConfig} />
        </div>
      ) : (
        <header className="mx-auto flex h-22 w-full max-w-3xl items-center gap-4 px-7 pt-4">
          <IconButton
            className="size-9 rounded-full border-border bg-surface-raised text-text-secondary"
            label="Voltar ao carrinho"
            onClick={onBackToCart}
            variant="outline"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
          </IconButton>
          <span className="text-size-18 font-bold">Pedido</span>
        </header>
      )}

      <main className="grid min-h-[calc(100svh-8rem)] place-items-center px-6 py-12">
        {controller.status === "loading" ? (
          <OrderStatusView
            kind="loading"
            onBackToCart={onBackToCart}
            onRetry={() => void controller.retry()}
          />
        ) : null}
        {controller.status === "error" ? (
          <OrderStatusView
            kind="error"
            onBackToCart={onBackToCart}
            onRetry={() => void controller.retry()}
          />
        ) : null}
        {controller.status === "pending" ? (
          <OrderStatusView
            kind="pending"
            onBackToCart={onBackToCart}
            onRetry={() => void controller.retry()}
          />
        ) : null}
        {controller.status === "refused" ? (
          <OrderStatusView
            kind="refused"
            message={controller.message}
            onBackToCart={onBackToCart}
            onRetry={() => void controller.retry()}
          />
        ) : null}
      </main>

      {controller.status === "confirmed" ? (
        <OrderReceipt onClose={onClose} order={controller.order} />
      ) : null}
    </div>
  )
}
