import { useEffect, useState } from "react"

function getSectionId(href: string) {
  return href.startsWith("#") ? href.slice(1) : href
}

export function useActiveHomeSection(sectionHrefs: readonly string[]) {
  const fallbackHref = sectionHrefs[0] ?? ""
  const [activeHref, setActiveHref] = useState(fallbackHref)

  useEffect(() => {
    const sections = sectionHrefs.flatMap((href) => {
      const element = document.getElementById(getSectionId(href))

      return element ? [{ element, href }] : []
    })

    if (sections.length === 0) return

    let animationFrame = 0

    function updateActiveSection() {
      cancelAnimationFrame(animationFrame)
      animationFrame = requestAnimationFrame(() => {
        const activationLine = Math.min(window.innerHeight * 0.3, 320)
        const reachedPageEnd =
          window.scrollY + window.innerHeight >=
          document.documentElement.scrollHeight - 2
        let nextHref = sections[0].href

        for (const section of sections) {
          if (section.element.getBoundingClientRect().top > activationLine) {
            break
          }

          nextHref = section.href
        }

        if (reachedPageEnd) {
          nextHref = sections.at(-1)?.href ?? nextHref
        }

        setActiveHref((currentHref) =>
          currentHref === nextHref ? currentHref : nextHref,
        )
      })
    }

    updateActiveSection()
    window.addEventListener("hashchange", updateActiveSection)
    window.addEventListener("resize", updateActiveSection)
    window.addEventListener("scroll", updateActiveSection, { passive: true })

    return () => {
      cancelAnimationFrame(animationFrame)
      window.removeEventListener("hashchange", updateActiveSection)
      window.removeEventListener("resize", updateActiveSection)
      window.removeEventListener("scroll", updateActiveSection)
    }
  }, [sectionHrefs])

  return activeHref
}
