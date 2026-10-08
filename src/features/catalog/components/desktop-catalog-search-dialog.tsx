import type { FormEvent, RefObject } from "react"

import { Button } from "@/shared/components/ui/button"
import { Dialog } from "@/shared/components/ui/dialog"
import { SearchField } from "@/shared/components/ui/search-field"

import { catalogFieldLimits } from "../config/catalog-field-limits"

interface DesktopCatalogSearchDialogProps {
  id: string
  open: boolean
  value: string
  triggerRef: RefObject<HTMLButtonElement | null>
  onOpenChange: (open: boolean) => void
  onSearch: (query: string) => void
}

export function DesktopCatalogSearchDialog({
  id,
  open,
  value,
  triggerRef,
  onOpenChange,
  onSearch,
}: DesktopCatalogSearchDialogProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const query = formData.get("query")

    onSearch(typeof query === "string" ? query.trim() : "")
    onOpenChange(false)
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <Dialog.Content
        id={id}
        onCloseAutoFocus={(event) => {
          event.preventDefault()
          triggerRef.current?.focus()
        }}
      >
        <Dialog.Header className="pr-10">
          <Dialog.Title>Buscar NFTs</Dialog.Title>
          <Dialog.Description>
            Pesquise pelo nome do NFT ou da coleção.
          </Dialog.Description>
        </Dialog.Header>

        <form
          aria-label="Busca no catálogo"
          className="mt-6 flex flex-col gap-5"
          onSubmit={handleSubmit}
          role="search"
        >
          <SearchField
            autoFocus
            defaultValue={value}
            inputWrapperClassName="h-12 border-border-soft bg-ink px-4"
            key={value}
            label="Buscar NFTs"
            maxLength={catalogFieldLimits.search}
            name="query"
            placeholder="Nome do NFT ou coleção"
          />
          <Dialog.Footer>
            <Button className="h-10 px-6" type="submit">
              Buscar
            </Button>
          </Dialog.Footer>
        </form>
      </Dialog.Content>
    </Dialog>
  )
}
