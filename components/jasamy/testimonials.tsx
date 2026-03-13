import { Star } from "lucide-react"
import { Reveal } from "@/components/jasamy/reveal"

const testimonials = [
  {
    id: "t1",
    quote: "El mejor arreglo que he comprado, super fresco y elegante.",
    name: "Maria P.",
  },
  {
    id: "t2",
    quote: "Entrega rápida y muy bonito. Volvere a pedir para fechas especiales.",
    name: "Carlos R.",
  },
  {
    id: "t3",
    quote: "Atención muy amable y diseños con excelente gusto.",
    name: "Andrea M.",
  },
]

export function Testimonials() {
  return (
    <section className="bg-card py-24 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal className="mb-12 text-center">
          <span className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Reseñas</span>
          <h2 className="ornament mt-4 font-serif text-4xl font-semibold text-foreground md:text-5xl">
            Lo que dicen nuestros clientes
          </h2>
        </Reveal>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((item, index) => (
            <Reveal key={item.id} delayMs={Math.min(index * 80, 240)}>
              <article className="h-full rounded-2xl border border-border/60 bg-background p-7 shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
                <div className="mb-4 flex gap-1 text-primary">
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">"{item.quote}"</p>
                <p className="mt-5 font-medium text-foreground">- {item.name}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

