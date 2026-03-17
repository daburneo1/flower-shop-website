import { carouselImages } from "@/lib/config"
import type { HeroSlide } from "@/lib/types"

export interface PresentedHeroSlide {
    image: string
    alt: string
}

export function presentHeroSlides(slides: HeroSlide[] = []): PresentedHeroSlide[] {
    const dynamicSlides = slides
        .filter((slide) => slide.is_active !== false && Boolean(slide.image_url))
        .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
        .map((slide) => ({
            image: slide.image_url,
            alt: slide.title || slide.subtitle || "Imagen destacada",
        }))

    return dynamicSlides.length > 0 ? dynamicSlides : carouselImages
}