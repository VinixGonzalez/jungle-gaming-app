export interface NftFavoriteActions {
  feedback: {
    kind: "error" | "status"
    message: string
  } | null
  isDisabled: boolean
  isFavorite: (nftId: string) => boolean
  isPending: boolean
  toggle: (nftId: string) => void
}
