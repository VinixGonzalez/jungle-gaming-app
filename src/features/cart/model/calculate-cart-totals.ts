import { formatWeiToEth, parseEthToWei } from "@/shared/utils"

import type {
  CartCoupon,
  CartItem,
  CartTotals,
} from "../api/cart.schemas"

const CART_NETWORK_FEE_ETH = "0.005"

export function calculateCartTotals(
  items: readonly Pick<CartItem, "edition" | "quantity">[],
  coupon: CartCoupon | null,
): CartTotals {
  const subtotalWei = items.reduce(
    (total, item) =>
      total + parseEthToWei(item.edition.priceEth) * BigInt(item.quantity),
    0n,
  )
  const discountWei = coupon
    ? (subtotalWei * BigInt(coupon.discountPercentage)) / 100n
    : 0n
  const networkFeeWei = items.length > 0
    ? parseEthToWei(CART_NETWORK_FEE_ETH)
    : 0n

  return {
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
    subtotalEth: formatWeiToEth(subtotalWei),
    discountEth: formatWeiToEth(discountWei),
    networkFeeEth: formatWeiToEth(networkFeeWei),
    totalEth: formatWeiToEth(subtotalWei - discountWei + networkFeeWei),
  }
}
