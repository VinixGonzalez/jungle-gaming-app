export const accountQueryKeys = {
  root: ["identity", "profile"] as const,
  profile: (userId: string) =>
    [...accountQueryKeys.root, userId] as const,
}
