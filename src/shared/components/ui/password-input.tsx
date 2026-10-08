import { forwardRef, useState, type ComponentPropsWithoutRef } from "react"
import { EyeOff } from "lucide-react"

import passwordHiddenIcon from "@/shared/assets/icons/auth/password-hidden.svg"
import { cn } from "@/shared/utils/cn"

import { Input } from "./input"

type PasswordInputProps = Omit<
  ComponentPropsWithoutRef<typeof Input>,
  "type"
>

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput({ className, disabled, ...props }, ref) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div className="relative">
      <Input
        ref={ref}
        {...props}
        className={cn("pr-11", className)}
        disabled={disabled}
        type={isVisible ? "text" : "password"}
      />
      <button
        aria-label={isVisible ? "Ocultar senha" : "Mostrar senha"}
        className="absolute top-1/2 right-3 grid size-8 -translate-y-1/2 place-items-center rounded-md text-text-secondary outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        disabled={disabled}
        onClick={() => setIsVisible((current) => !current)}
        type="button"
      >
        {isVisible ? (
          <EyeOff aria-hidden="true" className="size-4.5" />
        ) : (
          <img alt="" className="size-4.5" src={passwordHiddenIcon} />
        )}
      </button>
    </div>
  )
  },
)

export { PasswordInput }
