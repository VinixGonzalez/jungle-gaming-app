import type { ComponentProps } from "react"

import { SiteHeader } from "@/shared/components/layout"
import { Skeleton } from "@/shared/components/ui/skeleton"

interface CartLoadingStateProps {
  isDesktop: boolean
  headerConfig: Omit<ComponentProps<typeof SiteHeader>, "className">
}

export function CartLoadingState({
  isDesktop,
  headerConfig,
}: CartLoadingStateProps) {
  if (!isDesktop) {
    return (
      <main
        aria-busy="true"
        aria-label="Carregando carrinho"
        className="mx-auto min-h-svh w-full max-w-3xl overflow-hidden rounded-shell bg-ink px-6 pt-8"
      >
        <div className="flex h-11 items-center justify-between">
          <Skeleton className="size-11 rounded-full" />
          <Skeleton className="h-5 w-28" />
          <Skeleton className="size-11 rounded-full" />
        </div>
        <div className="mt-4 flex flex-col gap-5">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton className="h-25 w-full rounded-artwork" key={index} />
          ))}
        </div>
        <Skeleton className="mt-8 h-85 w-full rounded-t-[40px]" />
        <span className="sr-only">Carregando carrinho</span>
      </main>
    )
  }

  return (
    <div className="min-h-svh bg-ink text-foreground">
      <div className="mx-auto w-full max-w-content py-page-top-desktop">
        <SiteHeader {...headerConfig} />
        <main
          aria-busy="true"
          aria-label="Carregando carrinho"
          className="mt-8"
        >
          <Skeleton className="h-4 w-28" />
          <Skeleton className="mt-3 h-8 w-40" />
          <div className="mt-6 grid grid-cols-[minmax(0,782px)_332px] justify-between gap-12">
            <div className="flex flex-col gap-3">
              <Skeleton className="h-5 w-full" />
              {Array.from({ length: 3 }, (_, index) => (
                <Skeleton className="h-20 w-full" key={index} />
              ))}
            </div>
            <Skeleton className="h-97 w-full rounded-3xl" />
          </div>
          <Skeleton className="mt-24 h-8 w-72" />
          <div className="mt-8 grid grid-cols-5 gap-6">
            {Array.from({ length: 5 }, (_, index) => (
              <Skeleton className="h-76 w-full rounded-artwork" key={index} />
            ))}
          </div>
          <span className="sr-only">Carregando carrinho</span>
        </main>
      </div>
    </div>
  )
}
