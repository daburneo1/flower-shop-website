import type {
  AboutSection,
  Category,
  Florist,
  HeroSlide,
  MobilePaymentProvider,
  PaymentMethod,
  Product,
} from "@/lib/types"

export function mapFloristRow(row: Record<string, unknown>, floristId: string): Florist {
  return {
    id: floristId,
    name: String(row.name ?? ""),
    tagline: (row.slogan ?? row.tagline ?? null) as string | null,
    description: (row.description ?? null) as string | null,
    whatsapp_number: (row.whatsapp ?? row.whatsapp_number ?? null) as string | null,
    email: (row.email ?? null) as string | null,
    address: (row.address ?? null) as string | null,
    business_hours: (row.business_hours ?? null) as string | null,
    logo_url: (row.logo_url ?? null) as string | null,
    phone: (row.phone ?? null) as string | null,
    theme: (row.theme ?? null) as Record<string, unknown> | null,
    active: (row.active ?? null) as boolean | null,
    created_at: (row.created_at ?? null) as string | null,
    updated_at: (row.updated_at ?? null) as string | null,
  }
}

export function mapHeroSlideRow(row: Record<string, unknown>, floristId: string): HeroSlide {
  return {
    id: String(row.id),
    florist_id: floristId,
    title: (row.title ?? null) as string | null,
    subtitle: (row.subtitle ?? null) as string | null,
    image_url: String(row.image_url ?? ""),
    sort_order: (row.sort_order ?? null) as number | null,
    display_order: (row.display_order ?? row.sort_order ?? null) as number | null,
    is_active: (row.is_active ?? row.active ?? null) as boolean | null,
    created_at: (row.created_at ?? null) as string | null,
  }
}

export function mapCategoryRow(row: Record<string, unknown>, floristId: string): Category {
  return {
    id: String(row.id),
    florist_id: floristId,
    name: String(row.name ?? ""),
    description: (row.description ?? null) as string | null,
    image_url: (row.image_url ?? null) as string | null,
    sort_order: (row.sort_order ?? null) as number | null,
    display_order: (row.display_order ?? row.sort_order ?? null) as number | null,
    is_active: (row.is_active ?? row.active ?? null) as boolean | null,
    created_at: (row.created_at ?? null) as string | null,
  }
}

export function mapProductRow(
  row: Record<string, unknown>,
  floristId: string,
  categoryId?: string,
  categoryName?: string,
): Product {
  return {
    id: String(row.id),
    category_id: categoryId ?? (row.category_id as string | undefined),
    name: String(row.name ?? ""),
    description: (row.description ?? null) as string | null,
    price: Number(row.price ?? 0),
    image_url: (row.image_url ?? null) as string | null,
    is_active: (row.is_active ?? row.active ?? null) as boolean | null,
    created_at: (row.created_at ?? null) as string | null,
    updated_at: (row.updated_at ?? null) as string | null,
    category_name: categoryName ?? (row.category_name as string | undefined),
  }
}

export function mapPaymentMethodRow(row: Record<string, unknown>, floristId: string): PaymentMethod {
  return {
    id: String(row.id),
    florist_id: floristId,
    code: (row.code ?? null) as string | null,
    name: String(row.name ?? ""),
    description: (row.description ?? null) as string | null,
    icon: (row.icon ?? null) as string | null,
    is_active: (row.is_active ?? row.active ?? null) as boolean | null,
    display_order: (row.display_order ?? row.sort_order ?? null) as number | null,
    created_at: (row.created_at ?? null) as string | null,
  }
}

export function mapMobilePaymentProviderRow(
  row: Record<string, unknown>,
  floristId: string,
): MobilePaymentProvider {
  return {
    id: String(row.id),
    florist_id: floristId,
    payment_method_id: (row.payment_method_id ?? null) as string | null,
    name: String(row.name ?? ""),
    qr_code_url: (row.qr_code_url ?? row.qr_image_url ?? null) as string | null,
    sort_order: (row.sort_order ?? null) as number | null,
    display_order: (row.display_order ?? row.sort_order ?? null) as number | null,
    is_active: (row.is_active ?? row.active ?? null) as boolean | null,
    created_at: (row.created_at ?? null) as string | null,
  }
}

export function mapAboutRow(row: Record<string, unknown>, floristId: string): AboutSection {
  const years = row.years_experience as number | null | undefined
  const products = row.products_count as number | null | undefined
  const handmade = row.handmade_percentage as number | null | undefined

  const sectionId = String(row.id ?? floristId)
  const stats =
    years || products || handmade
      ? [
          years != null ? { id: "years", florist_id: floristId, label: "Anios de experiencia", value: `${years}+`, sort_order: 1 } : null,
          products != null ? { id: "products", florist_id: floristId, label: "Productos", value: `${products}+`, sort_order: 2 } : null,
          handmade != null ? { id: "handmade", florist_id: floristId, label: "Hecho a mano", value: `${handmade}%`, sort_order: 3 } : null,
        ].filter(Boolean)
      : []

  return {
    id: sectionId,
    florist_id: floristId,
    title: (row.title ?? null) as string | null,
    description: (row.description ?? row.content ?? null) as string | null,
    content: (row.content ?? null) as string | null,
    image_url: (row.image_url ?? null) as string | null,
    years_experience: years ?? null,
    products_count: products ?? null,
    handmade_percentage: handmade ?? null,
    created_at: (row.created_at ?? null) as string | null,
    stats: stats as AboutSection["stats"],
  }
}
