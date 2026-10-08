import { useMutation } from "@tanstack/react-query"

import { identityMutationScope, identityQueryCache } from "@/shared/query"

import { accountApi } from "../api/account.api"

export function useChangePasswordMutation() {
  return useMutation({
    gcTime: 0,
    mutationKey: [
      ...identityQueryCache.rootKey,
      "account",
      "change-password",
    ],
    mutationFn: accountApi.changePassword,
    scope: identityMutationScope,
  })
}
