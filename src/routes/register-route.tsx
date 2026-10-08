import { useSearch } from "@tanstack/react-router"

import { AuthPage } from "@/features/auth"

export function RegisterRoute() {
  const { returnTo } = useSearch({ from: "/marketplace/register" })

  return <AuthPage mode="register" returnTo={returnTo} />
}
