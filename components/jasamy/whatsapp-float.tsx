import { buildWhatsAppContactUrl } from "@/lib/config"
import { resolveWhatsAppNumber } from "@/features/florist/presenters/contact-presenter"
import { WhatsAppIcon } from "@/components/jasamy/shared/whatsapp-icon"
import type { Florist, ContactMethod } from "@/lib/types"

interface WhatsAppFloatProps {
  florist: Florist
  contactMethods: ContactMethod[]
}

export function WhatsAppFloat({ florist, contactMethods }: WhatsAppFloatProps) {
  const waNumber = resolveWhatsAppNumber(florist, contactMethods)

  if (!waNumber) return null

  const href = buildWhatsAppContactUrl(florist.name, waNumber)

  return (
      <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-5 right-5 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_12px_28px_rgba(0,0,0,0.28)] transition-transform hover:scale-105"
          aria-label="Abrir WhatsApp"
      >
        <WhatsAppIcon className="h-7 w-7" />
      </a>
  )
}