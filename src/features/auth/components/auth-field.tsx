import { forwardRef, type ComponentPropsWithoutRef } from "react"

import { Input } from "@/shared/components/ui/input"
import { PasswordInput } from "@/shared/components/ui/password-input"
import { cn } from "@/shared/utils"

interface AuthFieldProps extends ComponentPropsWithoutRef<typeof Input> {
  error?: string
  label: string
  password?: boolean
}

export const AuthField = forwardRef<HTMLInputElement, AuthFieldProps>(
  function AuthField(
    {
      className,
      error,
      id,
      label,
      password = false,
      type,
      ...props
    },
    ref,
  ) {
  const errorId = error && id ? `${id}-error` : undefined
  const Field = password ? PasswordInput : Input

  return (
    <div className="w-full">
      <label className="sr-only" htmlFor={id}>
        {label}
      </label>
      <div>
        <Field
          ref={ref}
          {...props}
          aria-describedby={errorId}
          aria-invalid={Boolean(error)}
          className={cn(
            "h-12.5 rounded-xl border-border px-4 text-size-14 leading-size-16 placeholder:text-secondary focus-visible:border-primary focus-visible:ring-0 xl:h-10 xl:rounded-control",
            password && "pr-12",
            className,
          )}
          id={id}
          {...(password ? {} : { type })}
        />
      </div>

      {error ? (
        <p
          className="mt-1 text-size-11 leading-size-14 text-error-text"
          id={errorId}
        >
          {error}
        </p>
      ) : null}
    </div>
  )
  },
)
