export interface NftPurchaseActions {
  cartCount: number
  feedback: {
    kind: "status" | "error"
    message: string
  } | null
  isPending: boolean
  add: (
    selection: {
      nftId: string
      editionId: string
      quantity: number
    },
    destination: "detail" | "cart",
  ) => void
}
