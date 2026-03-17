import Image from "next/image"
import { Reveal } from "@/components/jasamy/reveal"
import { SECTION_COPY } from "@/lib/constants/site-copy"

const galleryImages = [
  { src: "/images/arreglo-aniversario.jpg", alt: "Arreglo floral de aniversario" },
  { src: "/images/arreglo-cumple.jpg", alt: "Arreglo floral de cumpleanos" },
  { src: "/images/bouquet-novia.jpg", alt: "Bouquet para novia" },
  { src: "/images/centro-mesa.jpg", alt: "Centro de mesa floral" },
  { src: "/images/girasoles.jpg", alt: "Ramo de girasoles" },
  { src: "/images/lirios-blancos.jpg", alt: "Arreglo con lirios blancos" },
]

export function Gallery() {
  return (
      <section className="bg-background py-24 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <Reveal className="mb-12 text-center">
          <span className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
            {SECTION_COPY.gallery.eyebrow}
          </span>
            <h2 className="ornament mt-4 font-serif text-4xl font-semibold text-foreground md:text-5xl">
              {SECTION_COPY.gallery.title}
            </h2>
          </Reveal>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {galleryImages.map((image, index) => (
                <Reveal key={image.src} delayMs={Math.min(index * 60, 300)}>
                  <div className="group relative aspect-square overflow-hidden rounded-2xl">
                    <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />
                  </div>
                </Reveal>
            ))}
          </div>
        </div>
      </section>
  )
}