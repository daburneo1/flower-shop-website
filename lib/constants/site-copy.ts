export interface NavLinkItem {
    label: string
    href: string
}

export const PRIMARY_NAV_LINKS: NavLinkItem[] = [
    { label: "Inicio", href: "#inicio" },
    { label: "Nosotros", href: "#nosotros" },
    { label: "Productos", href: "#productos" },
    { label: "Pagos", href: "#pagos" },
    { label: "Contacto", href: "#contacto" },
]

export const FOOTER_NAV_LINKS: NavLinkItem[] = [
    { label: "Inicio", href: "#inicio" },
    { label: "Nosotros", href: "#nosotros" },
    { label: "Productos", href: "#productos" },
    { label: "Contacto", href: "#contacto" },
]

export const SECTION_COPY = {
    about: {
        eyebrow: "Nuestra Historia",
        fallbackTitle: "Sobre Nosotros",
    },
    products: {
        eyebrow: "Nuestro Catálogo",
        title: "Productos y Servicios",
        allLabel: "Todos",
        emptyMessage: "No hay productos en esta categoria aun.",
    },
    paymentMethods: {
        eyebrow: "Facilidad de Pago",
        title: "Métodos de Pago",
        qrDescription: "Escanea el QR de tu billetera favorita",
        qrModalTitle: "Escanea el codigo QR con tu billetera favorita",
    },
    contact: {
        eyebrow: "Encuentranos",
        title: "Contacto",
        whatsappCta: "Contactanos por WhatsApp",
        emptyMessage: "Agrega metodos de contacto desde el panel admin para mostrarlos aqui.",
    },
    testimonials: {
        eyebrow: "Reseñas",
        title: "Lo que dicen nuestros clientes",
    },
    gallery: {
        eyebrow: "Galeria",
        title: "Arreglos que enamoran",
    },
} as const