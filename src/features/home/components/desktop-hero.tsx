import { useState } from "react"

import { Carousel } from "@/shared/components/ui/carousel"
import { CarouselIndicators } from "@/shared/components/ui/carousel-indicators"

import { heroArtworks } from "../data/hero-artworks"

const desktopHeroSlides = heroArtworks.slice(0, 3)

export function DesktopHero() {
  const [activeSlide, setActiveSlide] = useState(0)

  return (
    <Carousel
      activeIndex={activeSlide}
      ariaLabel="Destaques da Kurio"
      className="flex h-112.5 w-full items-center overflow-hidden pl-10 focus-visible:ring-offset-0"
      items={desktopHeroSlides}
      loop
      onActiveIndexChange={setActiveSlide}
    >
      {({ activeIndex, activeItem, goTo, itemCount }) => (
        <div className="relative flex w-290 items-center justify-between">
          <div className="flex w-150 flex-col items-end gap-11">
            <div className="flex w-full flex-col items-start gap-8">
              <div className="flex w-full flex-col items-start gap-1">
                <div className="flex w-full flex-col items-start gap-2 text-foreground">
                  <p className="text-size-14 leading-size-16 font-medium tracking-[1.4px]">
                    Bem-vindo à Kurio
                  </p>
                  <h1
                    className="text-size-43 leading-size-70 font-bold"
                    id="desktop-home-hero-title"
                  >
                    <span className="block">SEJA DONO DO FUTURO</span>
                    <span className="block">DA ARTE DIGITAL</span>
                  </h1>
                </div>

                <p className="w-139.25 text-size-14 leading-size-24 font-normal text-text-secondary">
                  Descubra NFTs selecionados de criadores emergentes e consagrados.
                  Colecione arte digital rara, apoie artistas e tenha uma parte da
                  cultura da internet.
                </p>
              </div>

              <a
                className="flex h-10 w-35 items-center justify-center rounded-md bg-primary px-7 py-2.5 text-size-16 leading-size-20 font-bold text-ink transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:bg-primary-active"
                href="#catalogo"
              >
                EXPLORAR
              </a>
            </div>

            <CarouselIndicators
              activeIndex={activeIndex}
              ariaLabel="Selecionar destaque"
              className="h-2 gap-0 [&>button:first-child>span]:translate-x-2 [&>button:last-child>span]:-translate-x-2"
              count={itemCount}
              dotClassName="size-2 bg-primary group-hover:bg-primary"
              getItemLabel={(index) => `Ir para o destaque ${index + 1}`}
              onActiveIndexChange={goTo}
            />
          </div>

          {activeItem ? (
            <div
              aria-live="polite"
              aria-roledescription="slide"
              className="size-112.5"
              role="group"
            >
              <img
                alt={activeItem.alt}
                className="size-112.5 rounded-5xl object-cover"
                {...{ fetchpriority: "high" }}
                src={activeItem.desktopImage}
              />
            </div>
          ) : null}
        </div>
      )}
    </Carousel>
  )
}
