import type { ReactNode } from "react"

import { cn } from "@/shared/utils/cn"

interface FormFieldProps {
  children: ReactNode
  error?: string
  htmlFor: string
  label: string
  required?: boolean
  className?: string
}

function FormField({
  children,
  error,
  htmlFor,
  label,
  required = false,
  className,
}: FormFieldProps) {
  const errorId = error ? `${htmlFor}-error` : undefined

  return (
    <div className={cn("flex min-w-0 flex-col", className)}>
      <div className="flex min-h-6 items-center text-size-14 leading-size-16 text-foreground">
        <label htmlFor={htmlFor}>{label}</label>
        {required ? (
          <span className="ml-1 text-size-18 text-text-coral" aria-hidden="true">
            *
          </span>
        ) : null}
      </div>
      {children}
      {error ? (
        <p
          className="mt-1 text-size-11 leading-size-14 text-error-text"
          id={errorId}
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </div>
  )
}

export { FormField }
