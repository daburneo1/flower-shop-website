"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { carouselImages } from "@/lib/config"
import type { Florist } from "@/lib/types"

interface HeroProps {
  florist: Florist
}

export function Hero({ florist }: HeroProps) {
  const slides = carouselImages
  const [current, setCurrent] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const goTo = useCallback(
    (index: number) => {
      if (isTransitioning || index === current) return
      setIsTransitioning(true)
      setCurrent(index)
      setTimeout(() => setIsTransitioning(false), 800)
    },
    [isTransitioning, current],
  )

  const next = useCallback(() => {
    goTo((current + 1) % slides.length)
  }, [current, goTo, slides.length])

  const prev = useCallback(() => {
    goTo((current - 1 + slides.length) % slides.length)
  }, [current, goTo, slides.length])

  useEffect(() => {
    const timer = setInterval(next, 6000)
    return () => clearInterval(timer)
  }, [next])

  return (
    <section
      id="inicio"
      className="relative flex min-h-[50vh] items-center justify-center overflow-hidden lg:min-h-[60vh]"
      aria-roledescription="carousel"
      aria-label={`Trabajos recientes de ${florist.name}`}
    >
      {slides.map((slide, i) => (
        <div
          key={slide.image}
          className={`absolute inset-0 transition-opacity duration-800 ease-in-out ${i === current ? "opacity-100" : "opacity-0"}`}
          aria-hidden={i !== current}
          role="group"
          aria-roledescription="slide"
          aria-label={`${i + 1} de ${slides.length}: ${slide.alt}`}
        >
          <Image src={slide.image} alt={slide.alt} fill className="object-cover" priority={i === 0} />
          <div className="absolute inset-0 bg-foreground/25" />
        </div>
      ))}

      <span className="absolute left-1/2 top-8 z-10 -translate-x-1/2 whitespace-nowrap font-serif text-2xl font-medium tracking-wide text-card/85 drop-shadow-sm md:top-10 md:text-3xl lg:text-4xl">
        {`${florist.name}${florist.tagline ? ` | ${florist.tagline}` : ""}`}
      </span>

      <button
        type="button"
        onClick={prev}
        className="absolute left-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-card/20 bg-card/10 text-card backdrop-blur-sm transition-all hover:bg-card/25 md:left-8 md:h-11 md:w-11"
        aria-label="Diapositiva anterior"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={next}
        className="absolute right-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-card/20 bg-card/10 text-card backdrop-blur-sm transition-all hover:bg-card/25 md:right-8 md:h-11 md:w-11"
        aria-label="Siguiente diapositiva"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 gap-3">
        {slides.map((slide, i) => (
          <button
            key={slide.image}
            type="button"
            onClick={() => goTo(i)}
            className={`rounded-full transition-all duration-500 ${i === current ? "h-2 w-8 bg-card" : "h-2 w-2 bg-card/35 hover:bg-card/55"}`}
            aria-label={`Ir a diapositiva ${i + 1}`}
            aria-current={i === current ? "true" : undefined}
          />
        ))}
      </div>
    </section>
  )
}
