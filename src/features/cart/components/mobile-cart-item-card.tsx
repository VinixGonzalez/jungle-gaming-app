import { Link } from "@tanstack/react-router"
import { Trash2 } from "lucide-react"

import { IconButton } from "@/shared/components/ui/icon-button"
import { formatEth } from "@/shared/utils"

import type { CartItem } from "../api/cart.schemas"
import { CartItemQuantity } from "./cart-item-quantity"

interface MobileCartItemCardProps {
  item: CartItem
  isPending: boolean
  onQuantityChange: (itemId: string, quantity: number) => void
  onRemove: (itemId: string) => void
}

export function MobileCartItemCard({
  item,
  isPending,
  onQuantityChange,
  onRemove,
}: MobileCartItemCardProps) {
  return (
    <article
      aria-busy={isPending}
      className="grid min-h-25 grid-cols-[5.375rem_minmax(0,1fr)] gap-3 rounded-artwork bg-surface-card p-2 transition-opacity aria-busy:opacity-65"
    >
      <Link
        aria-label={`Ver detalhes de ${item.product.name}`}
        className="rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
        params={{ slug: item.product.slug }}
        to="/nfts/$slug"
      >
        <img
          alt=""
          className="size-21.5 rounded-xl object-cover"
          src={item.product.thumbnailUrl}
        />
      </Link>

      <div className="flex min-w-0 flex-col justify-between">
        <div className="grid grid-cols-[minmax(0,1fr)_2.75rem] items-start">
          <div className="min-w-0 pt-0.5">
            <Link
              className="line-clamp-1 text-size-15 leading-size-20 font-bold text-foreground outline-none hover:text-primary focus-visible:text-primary"
              params={{ slug: item.product.slug }}
              to="/nfts/$slug"
            >
              {item.product.name}
            </Link>
            <p className="mt-0.5 text-size-12 leading-size-16 text-text-secondary">
              Edição 1/{item.edition.totalSupply}
            </p>
          </div>
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
        </div>

        <div className="flex min-w-0 items-center justify-between gap-1">
          <p className="truncate text-size-16 leading-size-20 font-bold text-text-accent">
            {isPending ? "Atualizando..." : formatEth(item.lineTotalEth)}
          </p>
          <CartItemQuantity
            isPending={isPending}
            item={item}
            onQuantityChange={onQuantityChange}
          />
        </div>
      </div>
    </article>
  )
}
