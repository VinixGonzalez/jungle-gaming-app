import { Skeleton } from "@/shared/components/ui/skeleton"

export function ProfileLoadingState() {
  return (
    <div aria-busy="true" aria-label="Carregando perfil">
      <Skeleton className="h-6 w-64" />
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index}>
            <Skeleton className="mb-2 h-4 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
      <Skeleton className="mt-6 h-10 w-33" />
      <Skeleton className="mt-8 h-5 w-36" />
      <div className="mt-5 max-w-104.25 space-y-5">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index}>
            <Skeleton className="mb-2 h-4 w-28" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
      <span className="sr-only" role="status">
        Carregando perfil...
      </span>
    </div>
  )
}
