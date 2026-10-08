import { useSession } from "@/features/auth"
import { usePageTitle } from "@/shared/hooks"

import { useFavoritesController } from "../hooks/use-favorites-controller"
import { FavoriteItemCard } from "./favorite-item-card"
import { FavoritesEmptyState } from "./favorites-empty-state"
import { FavoritesErrorState } from "./favorites-error-state"
import { FavoritesLoadingState } from "./favorites-loading-state"

export function FavoritesPage() {
  const session = useSession()
  const favorites = useFavoritesController(session.data?.user.id)

  usePageTitle("Lista de interesse | Kurio")

  if (session.isPending || favorites.queryPending) {
    return <FavoritesLoadingState />
  }

  if (session.isError || favorites.queryError || !session.data) {
    return (
      <FavoritesErrorState
        onRetry={() => {
          void session.refetch()
          void favorites.retry()
        }}
      />
    )
  }

  return (
    <section aria-labelledby="favorites-title">
      <h1
        className="text-size-20 font-bold leading-size-24 md:text-size-24 md:leading-size-32"
        id="favorites-title"
      >
        Lista de interesse
      </h1>
      <p className="mt-2 text-size-13 leading-size-20 text-text-secondary">
        Obras que você marcou para acompanhar.
      </p>

      {favorites.feedback ? (
        <p
          className={
            favorites.feedback.kind === "error"
              ? "mt-4 text-size-12 text-error-text"
              : "mt-4 text-size-12 text-success"
          }
          role={favorites.feedback.kind === "error" ? "alert" : "status"}
        >
          {favorites.feedback.message}
        </p>
      ) : null}

      {favorites.items.length === 0 ? (
        <FavoritesEmptyState />
      ) : (
        <div className="mt-8 grid grid-cols-2 items-start gap-x-4 gap-y-8 md:grid-cols-3 xl:grid-cols-[repeat(3,258px)] xl:gap-x-8.5 xl:gap-y-14">
          {favorites.items.map((product) => (
            <FavoriteItemCard
              isPending={favorites.isPending}
              key={product.id}
              onRemove={() => void favorites.toggle(product.id)}
              product={product}
            />
          ))}
        </div>
      )}
    </section>
  )
}
