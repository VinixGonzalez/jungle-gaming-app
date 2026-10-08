import { Skeleton } from "@/shared/components/ui/skeleton"

const desktopCardSkeletons = Array.from({ length: 9 }, (_, index) => index)

export function DesktopCatalogLoadingState() {
  return (
    <section
      aria-busy="true"
      aria-label="Carregando mercado de NFTs"
      className="flex h-343.25 w-full items-start gap-12"
    >
      <div className="flex w-77.5 shrink-0 flex-col gap-6">
        <Skeleton className="h-196.25 w-77.5 rounded-none" />
        <Skeleton className="h-117.5 w-77.5 rounded-none" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-8">
        <Skeleton className="h-4.5 w-full" />
        <div className="grid w-full grid-cols-[repeat(3,258px)] gap-x-8.5 gap-y-18">
          {desktopCardSkeletons.map((index) => (
            <div className="flex w-64.5 flex-col gap-3" key={index}>
              <Skeleton className="h-75 w-full rounded-none" />
              <Skeleton className="h-5 w-4/5" />
              <Skeleton className="h-4 w-2/5" />
            </div>
          ))}
        </div>
      </div>
      <span className="sr-only">Carregando catálogo</span>
    </section>
  )
}
