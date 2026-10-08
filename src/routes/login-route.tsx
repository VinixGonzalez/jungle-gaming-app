import { useSearch } from "@tanstack/react-router"

import { AuthPage } from "@/features/auth"

export function LoginRoute() {
  const { returnTo } = useSearch({ from: "/marketplace/login" })

  return <AuthPage mode="login" returnTo={returnTo} />
}
