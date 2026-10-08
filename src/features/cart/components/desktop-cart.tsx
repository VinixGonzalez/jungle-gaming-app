import type { ComponentProps } from "react"
import { Link } from "@tanstack/react-router"

import { SiteFooter, SiteHeader } from "@/shared/components/layout"

import type {
  ApplyCartCouponInput,
  CartResponse,
} from "../api/cart.schemas"
import type { CartFeedback } from "../model/cart-feedback"
import { CartFeedbackMessage } from "./cart-feedback-message"
import { CartRecommendations } from "./cart-recommendations"
import { CartSummary } from "./cart-summary"
import { DesktopCartItemRow } from "./desktop-cart-item-row"

interface DesktopCartProps {
  cart: CartResponse
  headerConfig: Omit<ComponentProps<typeof SiteHeader>, "className">
  footerConfig: Omit<ComponentProps<typeof SiteFooter>, "className">
  pendingItemId?: string
  isUpdating: boolean
  feedback: CartFeedback | null
  onCheckout: () => void
  onQuantityChange: (itemId: string, quantity: number) => void
  onRemove: (itemId: string) => void
  onApplyCoupon: (input: ApplyCartCouponInput) => Promise<void>
  onRemoveCoupon: () => Promise<void>
}

export function DesktopCart({
  cart,
  headerConfig,
  footerConfig,
  pendingItemId,
  isUpdating,
  feedback,
  onCheckout,
  onQuantityChange,
  onRemove,
  onApplyCoupon,
  onRemoveCoupon,
}: DesktopCartProps) {
  return (
    <div className="min-h-svh bg-ink text-foreground">
      <div className="mx-auto flex w-full max-w-content flex-col py-page-top-desktop">
        <SiteHeader {...headerConfig} />

        <main className="mt-8">
          <nav aria-label="Breadcrumb" className="text-size-12 leading-size-16">
            <ol className="flex items-center gap-2 text-text-secondary">
              <li>
                <Link
                  className="outline-none hover:text-primary focus-visible:text-primary"
                  hash="catalogo"
                  to="/"
                >
                  Mercado
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-foreground">
                Carrinho
              </li>
            </ol>
          </nav>

          <h1 className="mt-3 text-size-28 leading-size-32 font-bold text-foreground">
            Carrinho
          </h1>

          <div className="mt-6 grid grid-cols-[minmax(0,782px)_332px] justify-between gap-12">
            <div className="min-w-0">
              <table className="w-full table-fixed border-collapse">
                <caption className="sr-only">Itens adicionados ao carrinho</caption>
                <colgroup>
                  <col />
                  <col className="w-30" />
                  <col className="w-40" />
                  <col className="w-34" />
                  <col className="w-12" />
                </colgroup>
                <thead className="border-b border-border text-left text-size-12 leading-size-16 text-text-secondary">
                  <tr>
                    <th className="pb-3 font-medium" scope="col">
                      Produto
                    </th>
                    <th className="px-2 pb-3 font-medium" scope="col">
                      Preço
                    </th>
                    <th className="px-2 pb-3 font-medium" scope="col">
                      Quantidade
                    </th>
                    <th className="px-2 pb-3 font-medium" scope="col">
                      Total
                    </th>
                    <th className="pb-3 text-right font-medium" scope="col">
                      <span className="sr-only">Remover</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {cart.items.map((item) => (
                    <DesktopCartItemRow
                      isPending={pendingItemId === item.id}
                      item={item}
                      key={item.id}
                      onQuantityChange={onQuantityChange}
                      onRemove={onRemove}
                    />
                  ))}
                </tbody>
              </table>

              <CartFeedbackMessage feedback={feedback} variant="list" />
            </div>

            <CartSummary
              cart={cart}
              isUpdating={isUpdating}
              onApplyCoupon={onApplyCoupon}
              onCheckout={onCheckout}
              onRemoveCoupon={onRemoveCoupon}
            />
          </div>

          <div className="mt-24">
            <CartRecommendations products={cart.recommendedItems} />
          </div>
        </main>

        <SiteFooter className="mt-24" {...footerConfig} />
      </div>
    </div>
  )
}
