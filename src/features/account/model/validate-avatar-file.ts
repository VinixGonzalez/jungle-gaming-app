const supportedAvatarTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
])

const maximumAvatarSize = 1024 * 1024

export function validateAvatarFile(file: File) {
  if (!supportedAvatarTypes.has(file.type)) {
    return "Envie uma imagem PNG, JPEG ou WebP."
  }

  if (file.size > maximumAvatarSize) {
    return "A imagem deve ter no máximo 1 MB."
  }

  return null
}
