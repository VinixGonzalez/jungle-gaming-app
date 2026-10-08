import type { Page } from "@playwright/test"

export async function waitForVisualReadiness(page: Page) {
  await page.evaluate(
    `(async () => {
      await document.fonts.ready

      const ensureImageLoaded = async (image) => {
        try {
          await image.decode()
        } catch (error) {
          const deadline = Date.now() + 10_000

          while (
            Date.now() < deadline &&
            (!image.complete ||
              image.naturalWidth === 0 ||
              image.naturalHeight === 0)
          ) {
            await new Promise((resolve) => setTimeout(resolve, 50))
          }

          if (
            !image.complete ||
            image.naturalWidth === 0 ||
            image.naturalHeight === 0
          ) {
            throw error
          }
        }
      }

      await Promise.all(Array.from(document.images, ensureImageLoaded))
      await new Promise((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(resolve))
      })
      await Promise.all(Array.from(document.images, ensureImageLoaded))
      window.scrollTo(0, 0)
      await new Promise((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(resolve))
      })
    })()`,
  )
  await page.mouse.move(0, 0)
}
