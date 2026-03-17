"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { presentHeroSlides } from "@/features/florist/presenters/hero-presenter"
import type { Florist, HeroSlide } from "@/lib/types"

interface HeroProps {
  florist: Florist
  slides?: HeroSlide[]
}

export function Hero({ florist, slides = [] }: HeroProps) {
  const resolvedSlides = presentHeroSlides(slides)
  const [current, setCurrent] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const goTo = useCallback(
      (index: number) => {
        if (isTransitioning || index === current) return

        setIsTransitioning(true)
        setCurrent(index)

        window.setTimeout(() => {
          setIsTransitioning(false)
        }, 800)
      },
      [current, isTransitioning],
  )

  const next = useCallback(() => {
    goTo((current + 1) % resolvedSlides.length)
  }, [current, goTo, resolvedSlides.length])

  const prev = useCallback(() => {
    goTo((current - 1 + resolvedSlides.length) % resolvedSlides.length)
  }, [current, goTo, resolvedSlides.length])

  useEffect(() => {
    if (resolvedSlides.length <= 1) return

    const timer = window.setInterval(next, 6000)
    return () => window.clearInterval(timer)
  }, [next, resolvedSlides.length])

  return (
      <section
          id="inicio"
          className="relative flex min-h-[68vh] items-center justify-center overflow-hidden pt-24 lg:min-h-[78vh]"
          aria-roledescription="carousel"
          aria-label={`Trabajos recientes de ${florist.name}`}
      >
        {resolvedSlides.map((slide, index) => (
            <div
                key={`${slide.image}-${index}`}
                className={`absolute inset-0 transition-opacity duration-800 ease-in-out ${
                    index === current ? "opacity-100" : "opacity-0"
                }`}
                aria-hidden={index !== current}
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} de ${resolvedSlides.length}: ${slide.alt}`}
            >
              <Image
                  src={slide.image}
                  alt={slide.alt}
                  fill
                  className="object-cover"
                  priority={index === 0}
              />
              <div className="absolute inset-0 bg-black/35" />
            </div>
        ))}

        {resolvedSlides.length > 1 && (
            <>
              <button
                  type="button"
                  onClick={prev}
                  className="absolute left-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-card/35 bg-card/15 text-card backdrop-blur-sm transition-all hover:bg-card/25 md:left-8 md:h-11 md:w-11"
                  aria-label="Diapositiva anterior"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <button
                  type="button"
                  onClick={next}
                  className="absolute right-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-card/35 bg-card/15 text-card backdrop-blur-sm transition-all hover:bg-card/25 md:right-8 md:h-11 md:w-11"
                  aria-label="Siguiente diapositiva"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 gap-3">
                {resolvedSlides.map((slide, index) => (
                    <button
                        key={`${slide.image}-dot-${index}`}
                        type="button"
                        onClick={() => goTo(index)}
                        className={`rounded-full transition-all duration-500 ${
                            index === current
                                ? "h-2 w-8 bg-card"
                                : "h-2 w-2 bg-card/35 hover:bg-card/55"
                        }`}
                        aria-label={`Ir a diapositiva ${index + 1}`}
                        aria-current={index === current ? "true" : undefined}
                    />
                ))}
              </div>
            </>
        )}
      </section>
  )
}