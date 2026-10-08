import { useQuery } from "@tanstack/react-query"

import { authSessionQueryOptions } from "../query/auth-session-query-options"

export function useSession() {
  return useQuery(authSessionQueryOptions)
}
