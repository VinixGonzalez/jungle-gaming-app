import type { ComponentProps } from "react"

import { SiteHeader } from "@/shared/components/layout"
import { Skeleton } from "@/shared/components/ui/skeleton"

interface NftDetailLoadingStateProps {
  isDesktop: boolean
  headerConfig: Omit<ComponentProps<typeof SiteHeader>, "className">
}

export function NftDetailLoadingState({
  isDesktop,
  headerConfig,
}: NftDetailLoadingStateProps) {
  if (!isDesktop) {
    return (
      <main
        aria-busy="true"
        aria-label="Carregando detalhes do NFT"
        className="relative mx-auto min-h-224 w-full max-w-3xl overflow-hidden rounded-shell bg-ink pb-44"
      >
        <div className="relative h-126 bg-surface-raised">
          <Skeleton className="absolute top-16.5 left-1/2 aspect-square w-[calc(100%-3rem)] max-w-89 -translate-x-1/2 rounded-5xl" />
        </div>
        <div className="relative -mt-28.5 flex min-h-126 flex-col gap-4 rounded-t-[31px] bg-surface-card px-6 pt-8">
          <Skeleton className="h-6 w-3/5" />
          <Skeleton className="h-18 w-full" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-11 w-3/4 rounded-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-3/5" />
        </div>
        <div className="fixed inset-x-0 bottom-0 mx-auto min-h-44 w-full max-w-3xl rounded-t-[40px] bg-surface-card px-6 pt-4 shadow-overlay-mobile">
          <Skeleton className="h-7 w-full" />
          <Skeleton className="mt-3 h-3 w-72" />
          <Skeleton className="mt-3 h-15 w-64 rounded-full" />
        </div>
        <span className="sr-only">Carregando detalhes do NFT</span>
      </main>
    )
  }

  return (
    <div className="min-h-svh bg-ink text-foreground">
      <div className="mx-auto flex w-full max-w-content flex-col gap-8 py-page-top-desktop">
        <SiteHeader {...headerConfig} />
        <main
          aria-busy="true"
          aria-label="Carregando detalhes do NFT"
          className="flex flex-col gap-24"
        >
          <div className="flex flex-col gap-3">
            <Skeleton className="h-4 w-36" />
            <div className="grid grid-cols-[573px_minmax(0,1fr)] gap-8">
              <div className="flex h-112 gap-7">
                <div className="flex w-25 flex-col gap-4">
                  {Array.from({ length: 2 }, (_, index) => (
                    <Skeleton className="size-25 rounded-lg" key={index} />
                  ))}
                </div>
                <Skeleton className="size-111 rounded-md" />
              </div>
              <div className="flex h-112 flex-col justify-between">
                <Skeleton className="h-8 w-4/5" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-11 w-1/2" />
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-18 w-3/5" />
              </div>
            </div>
          </div>
          <Skeleton className="h-64 w-full rounded-none" />
          <Skeleton className="h-80 w-full rounded-none" />
          <span className="sr-only">Carregando detalhes do NFT</span>
        </main>
      </div>
    </div>
  )
}
