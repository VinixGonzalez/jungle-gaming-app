import { useId, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Check, X } from "lucide-react"
import { useForm } from "react-hook-form"

import { getApiError } from "@/shared/api"
import { Button } from "@/shared/components/ui/button"
import { IconButton } from "@/shared/components/ui/icon-button"
import { Input } from "@/shared/components/ui/input"
import { useSingleFlight } from "@/shared/hooks"

import {
  applyCartCouponInputSchema,
  type ApplyCartCouponInput,
  type CartCoupon,
} from "../api/cart.schemas"
import { cartFieldLimits } from "../config/cart-field-limits"

interface CartCouponControlProps {
  coupon: CartCoupon | null
  isUpdating: boolean
  onApplyCoupon: (input: ApplyCartCouponInput) => Promise<void>
  onRemoveCoupon: () => Promise<void>
}

function getCouponErrorMessage(error: unknown) {
  const apiError = getApiError(error)

  if (apiError?.code === "COUPON_EXPIRED") {
    return "Este cupom expirou."
  }

  if (apiError?.code === "COUPON_INVALID") {
    return "Cupom inválido. Confira o código e tente novamente."
  }

  return "Não foi possível aplicar o cupom. Tente novamente."
}

export function CartCouponControl({
  coupon,
  isUpdating,
  onApplyCoupon,
  onRemoveCoupon,
}: CartCouponControlProps) {
  const inputId = useId()
  const errorId = `${inputId}-error`
  const [removeError, setRemoveError] = useState<string | null>(null)
  const runSingleFlight = useSingleFlight()
  const form = useForm<ApplyCartCouponInput>({
    defaultValues: { code: "" },
    resolver: zodResolver(applyCartCouponInputSchema),
  })
  const couponError = form.formState.errors.code?.message
  const isCouponPending = form.formState.isSubmitting

  async function submitCoupon(input: ApplyCartCouponInput) {
    await runSingleFlight(async () => {
      setRemoveError(null)

      try {
        await onApplyCoupon(input)
        form.reset()
      } catch (error) {
        form.setError("code", { message: getCouponErrorMessage(error) })
      }
    })
  }

  async function removeCoupon() {
    await runSingleFlight(async () => {
      setRemoveError(null)

      try {
        await onRemoveCoupon()
      } catch {
        setRemoveError("Não foi possível remover o cupom. Tente novamente.")
      }
    })
  }

  return (
    <div className="mt-5">
      <p className="mb-2 text-size-13 leading-size-16 font-bold text-foreground">
        Cupom de desconto
      </p>

      {coupon ? (
        <div className="flex h-12 items-center justify-between rounded-full border border-primary bg-surface-dark px-4">
          <span className="flex min-w-0 items-center gap-2 text-size-13 font-bold text-text-accent">
            <Check aria-hidden="true" className="size-4 shrink-0" />
            <span className="truncate">{coupon.code}</span>
          </span>
          <IconButton
            className="size-11 bg-transparent text-text-secondary hover:bg-transparent hover:text-primary"
            disabled={isUpdating}
            label={`Remover cupom ${coupon.code}`}
            onClick={() => void removeCoupon()}
            type="button"
            variant="ghost"
          >
            <X aria-hidden="true" className="size-4" />
          </IconButton>
        </div>
      ) : (
        <form
          className="flex h-12 items-center rounded-full border border-border bg-surface-dark pl-4 focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/30"
          onSubmit={form.handleSubmit(submitCoupon)}
        >
          <label className="sr-only" htmlFor={inputId}>
            Código do cupom
          </label>
          <Input
            aria-describedby={couponError ? errorId : undefined}
            aria-invalid={couponError ? true : undefined}
            autoComplete="off"
            className="h-full flex-1 border-0 px-0 uppercase focus-visible:ring-0"
            disabled={isCouponPending || isUpdating}
            id={inputId}
            maxLength={cartFieldLimits.couponCode}
            placeholder="Digite seu cupom"
            {...form.register("code")}
          />
          <Button
            className="h-12 rounded-full px-5 text-size-13 font-bold"
            disabled={isCouponPending || isUpdating}
            type="submit"
          >
            {isCouponPending ? "Aplicando..." : "Aplicar"}
          </Button>
        </form>
      )}

      {couponError ? (
        <p
          className="mt-2 text-size-11 leading-size-16 text-destructive"
          id={errorId}
          role="alert"
        >
          {couponError}
        </p>
      ) : null}
      {removeError ? (
        <p
          className="mt-2 text-size-11 leading-size-16 text-destructive"
          role="alert"
        >
          {removeError}
        </p>
      ) : null}
    </div>
  )
}
