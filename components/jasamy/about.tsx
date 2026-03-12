import Image from "next/image"
import type { AboutSection } from "@/lib/types"

interface AboutProps {
  about: AboutSection | null
}

export function About({ about }: AboutProps) {
  if (!about) return null

  return (
    <section id="nosotros" className="bg-card py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mb-16 text-center">
          <span className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
            Nuestra Historia
          </span>
          <h2 className="ornament mt-4 font-serif text-4xl font-semibold text-foreground md:text-5xl">
            <span className="text-balance">{about.title || "Sobre Nosotros"}</span>
          </h2>
        </div>

        <div className="flex flex-col items-center gap-16 lg:flex-row lg:gap-20">
          {about.image_url && (
            <div className="relative w-full max-w-md lg:w-1/2">
              <div className="absolute -bottom-3 -right-3 h-full w-full border border-accent/40" />
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image src={about.image_url} alt={about.title || "Sobre nosotros"} fill className="object-cover" />
              </div>
            </div>
          )}

          <div className={`flex flex-col gap-6 ${about.image_url ? "lg:w-1/2" : "max-w-2xl"}`}>
            {(about.paragraphs && about.paragraphs.length > 0
              ? about.paragraphs
              : about.description || about.content
                ? [{ id: "legacy", content: about.description ?? about.content ?? "" }]
                : []
            ).map((paragraph) => (
              <p key={paragraph.id} className="text-base leading-relaxed text-muted-foreground lg:text-lg">
                {paragraph.content}
              </p>
            ))}

            {about.stats && about.stats.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-12">
                {about.stats.map((stat) => (
                  <div key={stat.id} className="flex flex-col">
                    <span className="font-serif text-4xl font-semibold text-primary">{stat.value}</span>
                    <span className="mt-1 text-sm text-muted-foreground">{stat.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
