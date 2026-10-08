import { Skeleton } from "@/shared/components/ui/skeleton"

const favoriteSkeletons = Array.from({ length: 6 }, (_, index) => index)

export function FavoritesLoadingState() {
  return (
    <section aria-busy="true" aria-label="Carregando favoritos">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="mt-3 h-4 w-full max-w-120" />
      <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 xl:grid-cols-[repeat(3,258px)] xl:gap-x-8.5 xl:gap-y-14">
        {favoriteSkeletons.map((index) => (
          <div className="flex min-w-0 flex-col gap-3" key={index}>
            <Skeleton className="aspect-175/200 w-full rounded-4xl xl:h-75 xl:rounded-none" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-2/5" />
          </div>
        ))}
      </div>
      <span className="sr-only" role="status">
        Carregando lista de interesse...
      </span>
    </section>
  )
}
