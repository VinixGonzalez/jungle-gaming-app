import { useState } from "react"

import { useSession } from "@/features/auth"
import { useWalletsQuery } from "@/features/wallets"
import { Button } from "@/shared/components/ui/button"
import { usePageTitle } from "@/shared/hooks"

import { useProfileQuery } from "../hooks/use-profile-query"
import { WalletSection } from "./wallet-section"
import { WalletsLoadingState } from "./wallets-loading-state"

export function WalletsPage() {
  const [isSecondaryExpanded, setIsSecondaryExpanded] = useState(false)
  const session = useSession()
  const userId = session.data?.user.id
  const profile = useProfileQuery(userId)
  const wallets = useWalletsQuery(userId)

  usePageTitle("Carteiras | Kurio")

  if (
    session.isPending ||
    profile.isPending ||
    wallets.isPending
  ) {
    return <WalletsLoadingState />
  }

  if (
    session.isError ||
    profile.isError ||
    wallets.isError ||
    !profile.data ||
    !wallets.data
  ) {
    return (
      <div
        className="rounded-lg border border-error-text/40 bg-surface-card p-6"
        role="alert"
      >
        <h1 className="text-size-18 font-bold">
          Não foi possível carregar as carteiras
        </h1>
        <p className="mt-2 text-size-13 text-text-secondary">
          Verifique sua conexão e tente novamente.
        </p>
        <Button
          className="mt-5"
          onClick={() => {
            void session.refetch()
            void profile.refetch()
            void wallets.refetch()
          }}
          type="button"
        >
          Tentar novamente
        </Button>
      </div>
    )
  }

  const primaryWallet = wallets.data.wallets.find(
    (wallet) => wallet.role === "primary",
  )
  const secondaryWallet = wallets.data.wallets.find(
    (wallet) => wallet.role === "secondary",
  )

  return (
    <div>
      <h1 className="sr-only">Carteiras</h1>
      <WalletSection
        connection={wallets.data.connection}
        expanded
        profile={profile.data}
        relatedWallet={secondaryWallet}
        role="primary"
        wallet={primaryWallet}
      />
      <div className="mt-8 border-t border-border pt-7">
        <WalletSection
          connection={wallets.data.connection}
          expanded={isSecondaryExpanded}
          onExpandedChange={setIsSecondaryExpanded}
          profile={profile.data}
          relatedWallet={primaryWallet}
          role="secondary"
          wallet={secondaryWallet}
        />
      </div>
    </div>
  )
}
