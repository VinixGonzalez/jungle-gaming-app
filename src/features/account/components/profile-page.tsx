import { useSession } from "@/features/auth"
import { usePageTitle } from "@/shared/hooks"

import { useProfileQuery } from "../hooks/use-profile-query"
import { PasswordForm } from "./password-form"
import { ProfileDetailsForm } from "./profile-details-form"
import { ProfileErrorState } from "./profile-error-state"
import { ProfileLoadingState } from "./profile-loading-state"

export function ProfilePage() {
  const session = useSession()
  const profile = useProfileQuery(session.data?.user.id)

  usePageTitle("Perfil do colecionador | Kurio")

  if (session.isPending || profile.isPending) {
    return <ProfileLoadingState />
  }

  if (session.isError || profile.isError || !profile.data) {
    return (
      <ProfileErrorState
        onRetry={() => {
          void session.refetch()
          void profile.refetch()
        }}
      />
    )
  }

  return (
    <section aria-labelledby="profile-title">
      <h1
        className="text-size-20 font-bold leading-size-24 md:text-size-24 md:leading-size-32"
        id="profile-title"
      >
        Perfil do colecionador
      </h1>
      <ProfileDetailsForm profile={profile.data} />
      <PasswordForm />
    </section>
  )
}
