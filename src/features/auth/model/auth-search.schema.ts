interface AuthSearch {
  returnTo?: string
}

export function authSearchSchema(input: unknown): AuthSearch {
  if (typeof input !== "object" || input === null) return {}

  const returnTo = (input as Record<string, unknown>).returnTo

  return typeof returnTo === "string" && returnTo.length <= 2_048
    ? { returnTo }
    : {}
}
