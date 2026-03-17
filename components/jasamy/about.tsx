import Image from "next/image"
import { Flower2, Heart, Sparkles } from "lucide-react"
import { Reveal } from "@/components/jasamy/reveal"
import { presentAboutSection } from "@/features/florist/presenters/about-presenter"
import { SECTION_COPY } from "@/lib/constants/site-copy"
import type { AboutSection } from "@/lib/types"

interface AboutProps {
  about: AboutSection | null
}

export function About({ about }: AboutProps) {
  const presentedAbout = presentAboutSection(about)
  if (!presentedAbout) return null

  const statIcons = [Flower2, Sparkles, Heart]

  return (
      <section id="nosotros" className="bg-card py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <Reveal className="mb-16 text-center">
          <span className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
            {SECTION_COPY.about.eyebrow}
          </span>
            <h2 className="ornament mt-4 font-serif text-4xl font-semibold text-foreground md:text-5xl">
              <span className="text-balance">{presentedAbout.title}</span>
            </h2>
          </Reveal>

          <div className="flex flex-col items-center gap-16 lg:flex-row lg:gap-20">
            {presentedAbout.imageUrl && (
                <Reveal className="relative w-full max-w-md lg:w-1/2">
                  <div className="absolute -bottom-3 -right-3 h-full w-full border border-accent/40" />
                  <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
                    <Image
                        src={presentedAbout.imageUrl}
                        alt={presentedAbout.imageAlt}
                        fill
                        className="object-cover"
                    />
                  </div>
                </Reveal>
            )}

            <Reveal
                className={`flex flex-col gap-6 ${presentedAbout.contentClassName}`}
                delayMs={100}
            >
              {presentedAbout.paragraphs.map((paragraph) => (
                  <p
                      key={paragraph.id}
                      className="text-base leading-relaxed text-muted-foreground lg:text-lg"
                  >
                    {paragraph.content}
                  </p>
              ))}

              {presentedAbout.stats.length > 0 && (
                  <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {presentedAbout.stats.map((stat, index) => {
                      const Icon = statIcons[index % statIcons.length]

                      return (
                          <div
                              key={stat.id}
                              className="rounded-2xl border border-border/60 bg-card p-6 shadow-[0_10px_30px_rgba(0,0,0,0.08)]"
                          >
                            <Icon className="h-6 w-6 text-primary" />
                            <span className="mt-3 block font-serif text-4xl font-semibold text-primary">
                        {stat.value}
                      </span>
                            <span className="mt-1 block text-sm text-muted-foreground">
                        {stat.label}
                      </span>
                          </div>
                      )
                    })}
                  </div>
              )}
            </Reveal>
          </div>
        </div>
      </section>
  )
}