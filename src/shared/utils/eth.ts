const ETH_DECIMAL_PLACES = 18

const ETH_AMOUNT_PATTERN = /^(?:0|[1-9]\d{0,11})(?:\.\d{1,18})?$/

const WEI_PER_ETH = 10n ** BigInt(ETH_DECIMAL_PLACES)

function isEthAmount(value: string) {
  return ETH_AMOUNT_PATTERN.test(value)
}

function parseEthToWei(value: string) {
  if (!isEthAmount(value)) {
    throw new Error(`Invalid ETH amount: ${value}`)
  }

  const [wholePart, fractionalPart = ""] = value.split(".")
  const paddedFraction = fractionalPart.padEnd(ETH_DECIMAL_PLACES, "0")

  return BigInt(wholePart) * WEI_PER_ETH + BigInt(paddedFraction || "0")
}

function formatWeiToEth(value: bigint) {
  if (value < 0n) {
    throw new Error("ETH amount cannot be negative")
  }

  const wholePart = value / WEI_PER_ETH
  const fractionalPart = (value % WEI_PER_ETH)
    .toString()
    .padStart(ETH_DECIMAL_PLACES, "0")
    .replace(/0+$/, "")

  return fractionalPart ? `${wholePart}.${fractionalPart}` : wholePart.toString()
}

function formatEth(value: string, locale = "pt-BR") {
  const normalizedValue = formatWeiToEth(parseEthToWei(value))
  const [wholePart, fractionalPart] = normalizedValue.split(".")
  const formattedWholePart = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 0,
  }).format(BigInt(wholePart))

  if (!fractionalPart) {
    return `${formattedWholePart} ETH`
  }

  const decimalSeparator =
    new Intl.NumberFormat(locale)
      .formatToParts(1.1)
      .find((part) => part.type === "decimal")?.value ?? "."

  return `${formattedWholePart}${decimalSeparator}${fractionalPart} ETH`
}

export const eth = {
  amountPattern: ETH_AMOUNT_PATTERN,
  decimalPlaces: ETH_DECIMAL_PLACES,
  format: formatEth,
  formatWei: formatWeiToEth,
  isAmount: isEthAmount,
  parseToWei: parseEthToWei,
}
