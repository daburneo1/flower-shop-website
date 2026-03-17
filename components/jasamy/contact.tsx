import { Reveal } from "@/components/jasamy/reveal"
import { WhatsAppIcon } from "@/components/jasamy/shared/whatsapp-icon"
import { presentContactSection } from "@/features/florist/presenters/contact-presenter"
import type { Florist, ContactMethod } from "@/lib/types"

interface ContactProps {
  florist: Florist
  contactMethods: ContactMethod[]
}

export function Contact({ florist, contactMethods }: ContactProps) {
  const presentedContact = presentContactSection(florist, contactMethods)

  return (
      <section id="contacto" className="bg-background py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <Reveal className="mb-16 text-center">
          <span className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
            Encuentranos
          </span>
            <h2 className="ornament mt-4 font-serif text-4xl font-semibold text-foreground md:text-5xl">
              <span className="text-balance">Contacto</span>
            </h2>
          </Reveal>

          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <Reveal className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
              <iframe
                  title={presentedContact.mapTitle}
                  src={presentedContact.mapSrc}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-[360px] w-full border-0 md:h-[460px]"
              />
            </Reveal>

            <Reveal
                className="rounded-2xl border border-border/60 bg-card p-8 shadow-[0_10px_30px_rgba(0,0,0,0.08)]"
                delayMs={80}
            >
              <div className="space-y-5">
                {presentedContact.methods.map((item) => (
                    <div key={item.id} className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-accent/30 bg-accent/10">
                        <item.Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-serif text-lg font-semibold text-foreground">
                          {item.type}
                        </h3>
                        <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                          {item.value}
                        </p>
                      </div>
                    </div>
                ))}
              </div>

              {presentedContact.whatsAppUrl && (
                  <div className="mt-8 border-t border-border/50 pt-6">
                    <a
                        href={presentedContact.whatsAppUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 rounded-full bg-primary px-7 py-3 text-sm font-medium uppercase tracking-widest text-primary-foreground transition-all hover:bg-primary/90"
                    >
                      <WhatsAppIcon className="h-5 w-5" />
                      Contactanos por WhatsApp
                    </a>
                  </div>
              )}
            </Reveal>
          </div>

          {presentedContact.methods.length === 0 && (
              <div className="mt-10 rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
                Agrega metodos de contacto desde el panel admin para mostrarlos aqui.
              </div>
          )}
        </div>
      </section>
  )
}