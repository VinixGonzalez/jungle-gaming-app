import type { CartFeedback } from "../model/cart-feedback"

interface CartFeedbackMessageProps {
  feedback: CartFeedback | null
  variant: "list" | "empty"
}

export function CartFeedbackMessage({
  feedback,
  variant,
}: CartFeedbackMessageProps) {
  if (!feedback) return null

  const className = variant === "list"
    ? feedback.kind === "error"
      ? "mt-3 text-size-12 text-destructive"
      : "mt-3 text-size-12 text-text-secondary"
    : feedback.kind === "error"
      ? "text-size-12 text-destructive"
      : "text-size-12 text-text-accent"

  return (
    <p
      className={className}
      role={feedback.kind === "error" ? "alert" : "status"}
    >
      {feedback.message}
    </p>
  )
}
