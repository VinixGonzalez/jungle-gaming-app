export function readAvatarFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.addEventListener("load", () => {
      if (typeof reader.result === "string") {
        resolve(reader.result)
        return
      }

      reject(new Error("Não foi possível ler a imagem."))
    })
    reader.addEventListener("error", () => {
      reject(new Error("Não foi possível ler a imagem."))
    })
    reader.readAsDataURL(file)
  })
}
