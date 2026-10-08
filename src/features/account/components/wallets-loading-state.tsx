import { Skeleton } from "@/shared/components/ui/skeleton"

export function WalletsLoadingState() {
  return (
    <div aria-busy="true" aria-label="Carregando carteiras">
      <Skeleton className="h-5 w-52" />
      <Skeleton className="mt-2 h-4 w-full max-w-150" />
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {Array.from({ length: 10 }, (_, index) => (
          <div key={index}>
            <Skeleton className="mb-2 h-4 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
      <span className="sr-only" role="status">
        Carregando carteiras...
      </span>
    </div>
  )
}
