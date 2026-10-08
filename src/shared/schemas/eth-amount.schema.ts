import { z } from "zod"

import { ETH_AMOUNT_PATTERN, parseEthToWei } from "@/shared/utils"

export const ethAmountSchema = z
  .string()
  .regex(ETH_AMOUNT_PATTERN, "Use a decimal ETH amount with up to 18 decimal places")

export const positiveEthAmountSchema = ethAmountSchema.refine(
  (value) => parseEthToWei(value) > 0n,
  "ETH amount must be greater than zero",
)

export type EthAmount = z.infer<typeof ethAmountSchema>
