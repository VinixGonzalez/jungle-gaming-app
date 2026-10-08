import { useId, useState } from "react"

import { Tabs } from "@/shared/components/ui/tabs"

import type { NftDetailItem } from "../api/catalog.schemas"
import { catalogOptions } from "../config/catalog-options"

interface NftDetailDescriptionProps {
  item: NftDetailItem
}

export function NftDetailDescription({ item }: NftDetailDescriptionProps) {
  const [tab, setTab] = useState<"details" | "reviews">("details")
  const tabGroupId = useId()
  const detailsTabId = `${tabGroupId}-details-tab`
  const detailsPanelId = `${tabGroupId}-details-panel`
  const reviewsTabId = `${tabGroupId}-reviews-tab`
  const reviewsPanelId = `${tabGroupId}-reviews-panel`

  return (
    <section aria-label="Informações complementares do NFT">
      <Tabs
        activeTabClassName="after:h-0.75"
        ariaLabel="Informações do NFT"
        className="border-b border-border"
        items={[
          {
            value: "details",
            label: "Detalhes do NFT",
            id: detailsTabId,
            panelId: detailsPanelId,
          },
          {
            value: "reviews",
            label: `Avaliações de colecionadores (${item.rating.reviewCount})`,
            id: reviewsTabId,
            panelId: reviewsPanelId,
          },
        ]}
        onValueChange={setTab}
        tabClassName="pb-3 text-size-17 leading-size-16"
        value={tab}
      />

      {tab === "details" ? (
        <div
          aria-labelledby={detailsTabId}
          className="flex flex-col gap-3 pt-3 text-size-14 leading-size-24"
          id={detailsPanelId}
          role="tabpanel"
        >
          <p className="text-text-secondary">{item.description}</p>
          <h2 className="font-bold text-foreground">Rede:</h2>
          <p className="text-text-secondary">
            Publicado na rede {catalogOptions.networkLabels[item.network]} sob o padrão {item.contract.standard}.
          </p>
          <h2 className="font-bold text-foreground">Criador:</h2>
          <p className="text-text-secondary">{item.creator.name}</p>
          <h2 className="font-bold text-foreground">Contrato:</h2>
          <p className="break-all text-text-secondary">
            {item.contract.address}
          </p>
        </div>
      ) : (
        <div
          aria-labelledby={reviewsTabId}
          className="flex items-center gap-4 pt-6"
          id={reviewsPanelId}
          role="tabpanel"
        >
          <strong className="text-size-28 text-text-accent">
            {item.rating.average}/5
          </strong>
          <p className="text-size-14 leading-size-22 text-text-secondary">
            Média de {item.rating.reviewCount} avaliações verificadas.
          </p>
        </div>
      )}
    </section>
  )
}
