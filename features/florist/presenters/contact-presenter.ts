import { Clock, Globe, Mail, MapPin, Phone } from "lucide-react"
import type { ElementType } from "react"
import { buildWhatsAppContactUrl } from "@/lib/config"
import type { ContactMethod, Florist } from "@/lib/types"

const iconMap: Record<string, ElementType> = {
    direccion: MapPin,
    address: MapPin,
    telefono: Phone,
    phone: Phone,
    correo: Mail,
    email: Mail,
    horario: Clock,
    hours: Clock,
    whatsapp: Phone,
    website: Globe,
}

export interface PresentedContactMethod {
    id: string
    type: string
    value: string
    Icon: ElementType
}

export interface PresentedContactSection {
    mapSrc: string
    mapTitle: string
    whatsAppUrl: string | null
    methods: PresentedContactMethod[]
}

export function resolveWhatsAppNumber(
    florist: Florist,
    contactMethods: ContactMethod[],
): string | null {
    const fallbackWhatsApp = contactMethods.find((item) =>
        item.type?.toLowerCase().includes("whatsapp"),
    )?.value

    return florist.whatsapp_number ?? fallbackWhatsApp ?? null
}

export function presentContactSection(
    florist: Florist,
    contactMethods: ContactMethod[],
): PresentedContactSection {
    const waNumber = resolveWhatsAppNumber(florist, contactMethods)
    const whatsAppUrl = waNumber ? buildWhatsAppContactUrl(florist.name, waNumber) : null

    const hasCoordinates =
        typeof florist.latitude === "number" && typeof florist.longitude === "number"

    const mapQuery =
        florist.address ||
        contactMethods.find((item) => item.type?.toLowerCase().includes("direccion"))?.value ||
        florist.name

    const mapSrc = hasCoordinates
        ? `https://maps.google.com/maps?hl=es&q=${florist.latitude},${florist.longitude}&z=16&output=embed`
        : `https://maps.google.com/maps?hl=es&q=${encodeURIComponent(mapQuery)}&z=16&output=embed`

    return {
        mapSrc,
        mapTitle: hasCoordinates
            ? "Ubicacion exacta de la floristeria"
            : "Ubicacion en Google Maps",
        whatsAppUrl,
        methods: contactMethods.map((item) => ({
            id: item.id,
            type: item.type,
            value: item.value,
            Icon: iconMap[item.type?.toLowerCase()] ?? MapPin,
        })),
    }
}