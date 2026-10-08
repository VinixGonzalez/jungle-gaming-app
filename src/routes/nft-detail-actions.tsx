import { useCallback, useEffect, useMemo } from "react"
import { useLocation, useNavigate } from "@tanstack/react-router"

import { useSession } from "@/features/auth"
import { AccountNavigationAction } from "@/features/auth/account-navigation"
import { useAddToCart } from "@/features/cart"
import type {
  NftFavoriteActions,
  NftPurchaseActions,
} from "@/features/catalog"
import { useFavoritesController } from "@/features/favorites"

interface NftDetailActionsValue {
  accountAction: React.ReactNode
  favorite: NftFavoriteActions
  purchase: NftPurchaseActions
}

interface NftDetailActionsProps {
  onChange: (actions: NftDetailActionsValue) => void
}

export function NftDetailActions({ onChange }: NftDetailActionsProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const cart = useAddToCart()
  const session = useSession()
  const favorites = useFavoritesController(session.data?.user.id)
  const returnTo = location.href
  const addCartItem = cart.add
  const toggleFavoriteItem = favorites.toggle

  const addToCart = useCallback(
    async (
      selection: {
        nftId: string
        editionId: string
        quantity: number
      },
      destination: "detail" | "cart",
    ) => {
      const wasAdded = await addCartItem(selection)

      if (wasAdded && destination === "cart") {
        await navigate({ to: "/cart" })
      }
    },
    [addCartItem, navigate],
  )

  const toggleFavorite = useCallback(
    (nftId: string) => {
      if (session.isPending) return

      if (!session.data) {
        void navigate({
          to: "/login",
          search: { returnTo },
          state: {
            authCanGoBack: true,
            authReturnTo: returnTo,
          },
        })
        return
      }

      void toggleFavoriteItem(nftId)
    },
    [
      navigate,
      returnTo,
      session.data,
      session.isPending,
      toggleFavoriteItem,
    ],
  )

  const actions = useMemo<NftDetailActionsValue>(
    () => ({
      accountAction: (
        <AccountNavigationAction returnTo={returnTo} variant="desktop" />
      ),
      favorite: {
        feedback: favorites.feedback,
        isDisabled: favorites.isDisabled,
        isFavorite: favorites.isFavorite,
        isPending: session.isPending || favorites.isPending,
        toggle: toggleFavorite,
      },
      purchase: {
        add: (selection, destination) => {
          void addToCart(selection, destination)
        },
        cartCount: cart.cartCount,
        feedback: cart.feedback,
        isPending: cart.isPending,
      },
    }),
    [
      addToCart,
      cart.cartCount,
      cart.feedback,
      cart.isPending,
      favorites.feedback,
      favorites.isDisabled,
      favorites.isFavorite,
      favorites.isPending,
      returnTo,
      session.isPending,
      toggleFavorite,
    ],
  )

  useEffect(() => onChange(actions), [actions, onChange])

  return null
}
