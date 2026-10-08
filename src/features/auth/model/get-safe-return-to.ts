const fallbackPath = "/"
const baseUrl = "https://kurio.local"
const authRoutePattern = /^\/(?:login|register)(?:\/|$)/i

function hasControlCharacter(value: string) {
  return Array.from(value).some((character) => {
    const code = character.charCodeAt(0)

    return code <= 31 || code === 127
  })
}

export function getSafeReturnTo(value: unknown) {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value.length > 2_048 ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\")
  ) {
    return fallbackPath
  }

  try {
    const decodedValue = decodeURIComponent(value)

    if (
      decodedValue.startsWith("//") ||
      decodedValue.includes("\\") ||
      hasControlCharacter(decodedValue)
    ) {
      return fallbackPath
    }

    const url = new URL(value, baseUrl)

    if (url.origin !== baseUrl) return fallbackPath

    const decodedPathname = decodeURIComponent(url.pathname)
    const internalPath = `${url.pathname}${url.search}${url.hash}`

    if (
      !decodedPathname.startsWith("/") ||
      decodedPathname.startsWith("//") ||
      internalPath.startsWith("//") ||
      decodedPathname.includes("\\") ||
      hasControlCharacter(decodedPathname)
    ) {
      return fallbackPath
    }

    return authRoutePattern.test(decodedPathname) ? fallbackPath : internalPath
  } catch {
    return fallbackPath
  }
}
