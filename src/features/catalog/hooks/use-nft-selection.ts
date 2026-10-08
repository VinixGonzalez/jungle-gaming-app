import { useState } from "react"

import type { NftEdition } from "../api/catalog.schemas"

export function useNftSelection(editions: readonly NftEdition[]) {
  const initialEdition =
    editions.find((edition) => edition.availableQuantity > 0) ?? editions[0]
  const [selectedEditionId, setSelectedEditionId] = useState(
    initialEdition?.id ?? "",
  )
  const [quantity, setQuantity] = useState(1)
  const selectedEdition =
    editions.find((edition) => edition.id === selectedEditionId) ??
    initialEdition

  function selectEdition(editionId: string) {
    const edition = editions.find((item) => item.id === editionId)

    if (!edition || edition.availableQuantity === 0) return

    setSelectedEditionId(editionId)
    setQuantity(1)
  }

  function changeQuantity(nextQuantity: number) {
    if (!selectedEdition) return

    setQuantity(
      Math.min(
        Math.max(nextQuantity, 1),
        Math.max(selectedEdition.availableQuantity, 1),
      ),
    )
  }

  return {
    changeQuantity,
    quantity,
    selectedEdition,
    selectEdition,
  }
}
