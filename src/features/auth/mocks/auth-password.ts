const textEncoder = new TextEncoder()

export async function hashPassword(password: string) {
  const passwordBytes = textEncoder.encode(password)
  const digest = await crypto.subtle.digest("SHA-256", passwordBytes)

  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("")
}
