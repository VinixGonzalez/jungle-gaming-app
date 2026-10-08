import { useState } from "react"
import { ArrowRight } from "lucide-react"

import { Carousel } from "@/shared/components/ui/carousel"
import { CarouselIndicators } from "@/shared/components/ui/carousel-indicators"

import { heroArtworks } from "../data/hero-artworks"

const mobileHeroSlides = heroArtworks.slice(0, 3).map((primary, index) => ({
  primary,
  secondary: heroArtworks[index + 1] ?? heroArtworks[0],
}))

export function MobileHero() {
  const [activeSlide, setActiveSlide] = useState(0)

  return (
    <Carousel
      activeIndex={activeSlide}
      ariaLabel="Destaques da Kurio"
      className="relative flex h-47.5 w-full flex-col items-center justify-center overflow-hidden rounded-[30px] bg-[linear-gradient(116.8816deg,rgba(210,138,76,0.2)_1.0815%,rgba(210,138,76,0.1)_99.2325%)] p-4 before:absolute before:-left-20 before:-top-7.75 before:size-62 before:rounded-full before:bg-[linear-gradient(160.2532deg,rgba(221,154,95,0.43)_22.1013%,rgba(210,138,76,0.04)_87.4163%)] before:content-[''] after:absolute after:left-18.25 after:-top-2.5 after:size-62 after:rounded-full after:bg-[linear-gradient(160.2532deg,rgba(221,154,95,0.37)_22.1013%,rgba(210,138,76,0)_87.4163%)] after:content-[''] focus-visible:ring-offset-0"
      items={mobileHeroSlides}
      loop
      onActiveIndexChange={setActiveSlide}
    >
      {({ activeIndex, activeItem, goTo, itemCount }) => (
        <div className="relative z-10 flex w-full flex-col items-center gap-4">
          <div className="flex w-full items-center gap-2">
            <div className="flex min-w-0 flex-1 flex-col items-start">
              <div className="flex w-full flex-col items-start gap-1.5">
                <p className="text-size-12 leading-size-16 font-medium text-foreground">
                  Bem-vindo à Kurio
                </p>
                <h1
                  className="w-full text-[clamp(1rem,4.35vw,1.125rem)] leading-size-29 font-bold text-foreground"
                  id="mobile-home-hero-title"
                >
                  <span className="block">SEJA DONO DA</span>
                  <span className="block">CULTURA DIGITAL</span>
                </h1>
                <p className="w-full text-size-12 leading-size-18 font-normal text-text-secondary">
                  Descubra NFTs selecionados de criadores do mundo todo.
                </p>
              </div>

              <a
                className="flex items-center gap-2 text-size-12 leading-size-14 font-bold text-text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                href="#catalogo"
              >
                EXPLORAR
                <ArrowRight
                  aria-hidden="true"
                  className="size-4.5"
                  strokeWidth={1.5}
                />
              </a>
            </div>

            {activeItem ? (
              <div
                aria-live="polite"
                aria-roledescription="slide"
                className="relative aspect-138/146 w-[min(138px,41.32%)] shrink-0"
                role="group"
              >
                <img
                  alt={activeItem.primary.alt}
                  className="absolute left-0 top-0 aspect-square w-full rounded-3xl object-cover"
                  {...{ fetchpriority: "high" }}
                  src={activeItem.primary.mobileImage}
                />
                <img
                  alt={activeItem.secondary.alt}
                  className="absolute left-[10.145%] top-[60.274%] aspect-square w-[42.029%] rounded-3xl object-cover"
                  loading="lazy"
                  src={activeItem.secondary.mobileImage}
                />
              </div>
            ) : null}
          </div>

          <CarouselIndicators
            activeIndex={activeIndex}
            ariaLabel="Selecionar destaque"
            className="h-1.75 gap-0 [&>button:first-child>span]:translate-x-2.75 [&>button:last-child>span]:-translate-x-2.75"
            count={itemCount}
            dotClassName="size-1.75 bg-primary group-hover:bg-primary"
            getItemLabel={(index) => `Ir para o destaque ${index + 1}`}
            onActiveIndexChange={goTo}
          />
        </div>
      )}
    </Carousel>
  )
}
