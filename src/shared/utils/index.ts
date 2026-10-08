import { eth } from "./eth"

export { cn } from "./cn"
export { eth }

export const {
  amountPattern: ETH_AMOUNT_PATTERN,
  decimalPlaces: ETH_DECIMAL_PLACES,
  format: formatEth,
  formatWei: formatWeiToEth,
  isAmount: isEthAmount,
  parseToWei: parseEthToWei,
} = eth
