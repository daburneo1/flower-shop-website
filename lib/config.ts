// ============================================================
// STATIC CONFIG -- Things that do NOT come from the database
// ============================================================
// Everything dynamic (brand, contact, products, categories,
// payment methods, about, social links) is fetched from
// Supabase per florist using NEXT_PUBLIC_FLORIST_ID.
//
// COLORS: Change the CSS custom property values in globals.css
// FONTS:  Swap the Google Font imports in app/layout.tsx and
//         update fontFamily in tailwind.config.ts
// ============================================================

/** Generic carousel images (decorative, not managed in admin) */
export const carouselImages = [
  { image: "/images/hero-flowers.jpg", alt: "Arreglo floral artesanal" },
  { image: "/images/carousel-boda.jpg", alt: "Decoracion floral para boda" },
  { image: "/images/carousel-evento.jpg", alt: "Centros de mesa para evento" },
  { image: "/images/carousel-boutique.jpg", alt: "Bouquet artesanal" },
  { image: "/images/carousel-aniversario.jpg", alt: "Arreglo de aniversario" },
]

/** Build a WhatsApp link for a product inquiry */
export function buildWhatsAppUrl(
  shopName: string,
  whatsapp: string,
  productName: string,
  price: number,
): string {
  const msg = `Hola ${shopName}! Me interesa el producto: *${productName}* (Precio: $${price.toFixed(2)}). Me gustaria obtener mas informacion y hacer un pedido.`
  return `https://wa.me/${whatsapp}?text=${encodeURIComponent(msg)}`
}

/** Build a general WhatsApp contact link */
export function buildWhatsAppContactUrl(
  shopName: string,
  whatsapp: string,
  message?: string,
): string {
  const msg = message ?? `Hola ${shopName}, tengo una consulta`
  return `https://wa.me/${whatsapp}?text=${encodeURIComponent(msg)}`
}
