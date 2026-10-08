import { ArrowRight } from "lucide-react"

import { promoCards } from "../data/promo-cards"

const promoLayouts = [
  {
    image: "-left-1.25 w-73 rounded-[18px]",
    content: "right-7.5",
    description: "w-65.75",
  },
  {
    image: "left-0.5 w-71.75 rounded-[17px]",
    content: "right-8.75",
    description: "w-63",
  },
] as const

export function DesktopPromos() {
  return (
    <section
      aria-label="Destaques da Kurio"
      className="flex w-full gap-7 overflow-hidden"
      id="criadores"
    >
      {promoCards.map((promo, index) => {
        const layout = promoLayouts[index] ?? promoLayouts[0]

        return (
          <article
            className="relative h-62.5 w-146.5 shrink-0 overflow-hidden rounded-lg bg-surface-card before:pointer-events-none before:absolute before:-left-47.75 before:top-35.5 before:size-64 before:rounded-full before:border-2 before:border-primary before:content-[''] after:pointer-events-none after:absolute after:-left-49.75 after:top-33.5 after:size-64 after:rounded-full after:border after:border-primary after:content-['']"
            key={promo.title.join("-")}
          >
            <img
              alt={promo.imageAlt}
              className={`absolute top-0 h-62.5 object-cover ${layout.image}`}
              loading="lazy"
              src={promo.image}
            />

            <div className={`absolute top-9.25 text-right ${layout.content}`}>
              <h2 className="text-size-18 leading-size-24 font-bold text-foreground">
                <span className="block">{promo.title[0]}</span>
                <span className="block">{promo.title[1]}</span>
              </h2>
            </div>

            <p
              className={`absolute top-23.5 h-11.25 text-right text-size-14 leading-size-24 font-normal text-text-secondary ${layout.content} ${layout.description}`}
            >
              {promo.description}
            </p>

            <a
              className={`absolute top-41 flex h-10 w-35 items-center justify-center gap-3 rounded-md bg-primary text-size-14 leading-size-20 font-medium text-ink transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:bg-primary-active ${layout.content}`}
              href="#catalogo"
            >
              Explorar
              <ArrowRight
                aria-hidden="true"
                className="size-5"
                strokeWidth={1.5}
              />
            </a>
          </article>
        )
      })}
    </section>
  )
}
