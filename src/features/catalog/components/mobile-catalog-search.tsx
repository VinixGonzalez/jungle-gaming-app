import type { FormEvent, Ref } from "react"
import { SlidersHorizontal } from "lucide-react"

import { IconButton } from "@/shared/components/ui/icon-button"
import { SearchField } from "@/shared/components/ui/search-field"

import { catalogFieldLimits } from "../config/catalog-field-limits"

interface MobileCatalogSearchProps {
  filterButtonRef?: Ref<HTMLButtonElement>
  filtersDialogId: string
  filtersOpen: boolean
  value: string
  onFilterClick?: () => void
  onSearch: (query: string) => void
}

export function MobileCatalogSearch({
  filterButtonRef,
  filtersDialogId,
  filtersOpen,
  value,
  onFilterClick,
  onSearch,
}: MobileCatalogSearchProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const query = formData.get("query")

    onSearch(typeof query === "string" ? query.trim() : "")
  }

  return (
    <form
      aria-label="Busca no catálogo"
      className="flex h-11.25 w-full gap-2"
      onSubmit={handleSubmit}
      role="search"
    >
      <SearchField
        className="text-size-14 leading-size-16 font-bold placeholder:text-secondary"
        containerClassName="min-w-0 flex-1 gap-0"
        iconClassName="size-5.5 text-foreground group-focus-within/search-field:text-primary"
        inputWrapperClassName="h-11.25 rounded-xl border-0 bg-surface-card px-3 focus-within:border-transparent focus-within:ring-2 focus-within:ring-primary/40"
        defaultValue={value}
        key={value}
        label="Explorar coleções"
        maxLength={catalogFieldLimits.search}
        name="query"
        placeholder="Explorar coleções"
      />

      <IconButton
        ref={filterButtonRef}
        aria-controls={filtersDialogId}
        aria-expanded={filtersOpen}
        aria-haspopup="dialog"
        className="size-11.25 rounded-[14px] border-0 bg-[linear-gradient(137.045deg,rgb(210_138_76/45%)_24.603%,#d28a4c_100%)] text-ink hover:bg-[linear-gradient(137.045deg,rgb(221_154_95/60%)_24.603%,#dd9a5f_100%)] focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-100"
        disabled={!onFilterClick}
        label="Abrir filtros"
        onClick={onFilterClick}
        type="button"
      >
        <SlidersHorizontal aria-hidden="true" className="size-5.5" strokeWidth={1.75} />
      </IconButton>
    </form>
  )
}
