import { QuantityStepper } from "@/shared/components/ui/quantity-stepper"

import type { CartItem } from "../api/cart.schemas"

interface CartItemQuantityProps {
  item: CartItem
  isPending: boolean
  onQuantityChange: (itemId: string, quantity: number) => void
}

export function CartItemQuantity({
  item,
  isPending,
  onQuantityChange,
}: CartItemQuantityProps) {
  return (
    <QuantityStepper
      decrementLabel={`Diminuir quantidade de ${item.product.name}`}
      disabled={isPending}
      groupLabel={`Quantidade de ${item.product.name}`}
      incrementLabel={`Aumentar quantidade de ${item.product.name}`}
      maximum={item.edition.availableQuantity}
      onValueChange={(quantity) => onQuantityChange(item.id, quantity)}
      size="compact"
      value={item.quantity}
      variant="subtle"
    />
  )
}
