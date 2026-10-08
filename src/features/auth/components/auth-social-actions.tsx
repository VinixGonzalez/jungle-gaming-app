import facebookIcon from "@/shared/assets/icons/auth/facebook.svg"
import googleIcon from "@/shared/assets/icons/auth/google.svg"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/utils"

interface AuthSocialActionsProps {
  compact?: boolean
}

export function AuthSocialActions({ compact = false }: AuthSocialActionsProps) {
  const buttonClassName =
    "h-10 w-full gap-3 rounded-control border-border text-size-13 leading-size-16 font-medium text-text-secondary disabled:cursor-not-allowed disabled:opacity-100"

  return (
    <section
      aria-label="Outras formas de acesso"
      className={cn(
        "flex w-full flex-col gap-3 xl:pt-6",
        !compact && "xl:gap-4",
      )}
    >
      <div className="flex w-full items-center gap-2.5 xl:gap-3">
        <span aria-hidden="true" className="h-px flex-1 bg-border" />
        <span className="text-size-13 leading-size-16 text-foreground">
          Ou continue com
        </span>
        <span aria-hidden="true" className="h-px flex-1 bg-border" />
      </div>

      <div
        className={cn(
          "flex w-full flex-col gap-4 xl:px-20",
          compact && "xl:gap-3",
        )}
      >
        <Button
          className={buttonClassName}
          disabled
          title="Login com Google não está disponível nesta demonstração."
          type="button"
          variant="outline"
        >
          <img alt="" className="size-5" src={googleIcon} />
          Continuar com Google
        </Button>
        <Button
          className={buttonClassName}
          disabled
          title="Login com Facebook não está disponível nesta demonstração."
          type="button"
          variant="outline"
        >
          <img alt="" className="size-5" src={facebookIcon} />
          Continuar com Facebook
        </Button>
      </div>
    </section>
  )
}
