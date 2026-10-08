import { Link } from "@tanstack/react-router"
import { Trash2 } from "lucide-react"

import { IconButton } from "@/shared/components/ui/icon-button"
import { formatEth } from "@/shared/utils"

import type { CartItem } from "../api/cart.schemas"
import { CartItemQuantity } from "./cart-item-quantity"

interface DesktopCartItemRowProps {
  item: CartItem
  isPending: boolean
  onQuantityChange: (itemId: string, quantity: number) => void
  onRemove: (itemId: string) => void
}

export function DesktopCartItemRow({
  item,
  isPending,
  onQuantityChange,
  onRemove,
}: DesktopCartItemRowProps) {
  return (
    <tr
      aria-busy={isPending}
      className="h-20 border-b border-border/70 transition-opacity last:border-b-0 aria-busy:opacity-65"
    >
      <td className="py-1 pr-4">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            aria-label={`Ver detalhes de ${item.product.name}`}
            className="shrink-0 rounded-artwork outline-none focus-visible:ring-2 focus-visible:ring-ring"
            params={{ slug: item.product.slug }}
            to="/nfts/$slug"
          >
            <img
              alt=""
              className="size-17.5 rounded-artwork object-cover max-xl:size-21.5"
              src={item.product.thumbnailUrl}
            />
          </Link>
          <div className="min-w-0">
            <Link
              className="line-clamp-2 text-size-15 leading-size-20 font-bold text-foreground outline-none transition-colors hover:text-primary focus-visible:text-primary"
              params={{ slug: item.product.slug }}
              to="/nfts/$slug"
            >
              {item.product.name}
            </Link>
            <p className="mt-1 text-size-12 leading-size-16 text-text-secondary">
              Edição 1/{item.edition.totalSupply}
            </p>
          </div>
        </div>
      </td>
      <td className="px-2 text-size-14 whitespace-nowrap text-text-secondary">
        {formatEth(item.edition.priceEth)}
      </td>
      <td className="px-2">
        <CartItemQuantity
          isPending={isPending}
          item={item}
          onQuantityChange={onQuantityChange}
        />
      </td>
      <td className="px-2 text-size-15 font-bold whitespace-nowrap text-text-accent">
        {isPending ? "Atualizando..." : formatEth(item.lineTotalEth)}
      </td>
      <td className="pl-1 text-right">
        <IconButton
          className="size-11 rounded-full bg-transparent text-text-secondary hover:bg-surface-raised hover:text-primary"
          disabled={isPending}
          label={`Remover ${item.product.name} do carrinho`}
          onClick={() => onRemove(item.id)}
          type="button"
          variant="ghost"
        >
          <Trash2 aria-hidden="true" className="size-4.5" />
        </IconButton>
      </td>
    </tr>
  )
}
