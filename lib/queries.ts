import { createClient } from "@/lib/supabase/server"
import {
  mapAboutRow,
  mapCategoryRow,
  mapFloristRow,
  mapHeroSlideRow,
  mapMobilePaymentProviderRow,
  mapPaymentMethodRow,
  mapProductRow,
} from "@/lib/mappers"
import type {
  Florist,
  HeroSlide,
  Category,
  Product,
  PaymentMethod,
  AboutSection,
  ContactMethod,
  SocialLink,
  FloristFullData,
} from "@/lib/types"

function getFloristId(): string | null {
  const raw =
    process.env.NEXT_PUBLIC_FLORIST_ID?.trim() ??
    process.env.FLORIST_ID?.trim() ??
    null
  return raw && raw.length > 0 ? raw : null
}

// ── Individual queries ───────────────────────────────────

export async function getFlorist(): Promise<Florist | null> {
  const floristId = getFloristId()
  if (!floristId) return null

  const supabase = await createClient()
  const { data } = await supabase
    .rpc("sp_get_florist", { p_florist_id: floristId })
    .single()
  if (!data) return null
  return mapFloristRow(data as Record<string, unknown>, floristId)
}

export async function getHeroSlides(): Promise<HeroSlide[]> {
  const floristId = getFloristId()
  if (!floristId) return []

  const supabase = await createClient()
  const { data } = await supabase.rpc("sp_list_hero_slides", { p_florist_id: floristId })
  return (data ?? []).map((row: Record<string, unknown>) =>
    mapHeroSlideRow(row, floristId),
  )
}

export async function getCategories(): Promise<Category[]> {
  const floristId = getFloristId()
  if (!floristId) return []

  const supabase = await createClient()
  const { data } = await supabase.rpc("sp_list_categories", { p_florist_id: floristId })
  return (data ?? []).map((row: Record<string, unknown>) =>
    mapCategoryRow(row, floristId),
  )
}

export async function getProducts(): Promise<Product[]> {
  const floristId = getFloristId()
  if (!floristId) return []

  const supabase = await createClient()
  const categories = await getCategories()
  if (categories.length === 0) return []

  const productsByCategory = await Promise.all(
    categories.map(async (category) => {
      const { data } = await supabase.rpc("sp_list_products", {
        p_florist_id: floristId,
        p_category_id: category.id,
      })
      return (data ?? []).map((row: Record<string, unknown>) =>
        mapProductRow(row, floristId, category.id, category.name),
      )
    }),
  )

  return productsByCategory.flat()
}

export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  const floristId = getFloristId()
  if (!floristId) return []

  const supabase = await createClient()
  const { data: methods } = await supabase.rpc("sp_list_payment_methods", { p_florist_id: floristId })
  const { data: providers } = await supabase.rpc("sp_list_mobile_payment_providers", {
    p_florist_id: floristId,
  })

  const mappedMethods = (methods ?? []).map((row: Record<string, unknown>) =>
    mapPaymentMethodRow(row, floristId),
  )
  const mappedProviders = (providers ?? []).map((row: Record<string, unknown>) =>
    mapMobilePaymentProviderRow(row, floristId),
  )

  return mappedMethods.map((method) =>
    method.code?.toUpperCase() === "MOBILE_PAY"
      ? { ...method, providers: mappedProviders }
      : method,
  )
}

export async function getAboutSection(): Promise<AboutSection | null> {
  const floristId = getFloristId()
  if (!floristId) return null

  const supabase = await createClient()
  const [{ data: about }, { data: paragraphs }, { data: stats }] = await Promise.all([
    supabase
      .from("about_section")
      .select("*")
      .eq("florist_id", floristId)
      .single(),
    supabase
      .from("about_paragraphs")
      .select("*")
      .eq("florist_id", floristId)
      .order("sort_order"),
    supabase
      .from("about_stats")
      .select("*")
      .eq("florist_id", floristId)
      .order("sort_order"),
  ])

  if (!about) return null
  const base = mapAboutRow(about as Record<string, unknown>, floristId)
  const mappedParagraphs =
    (paragraphs ?? []).map((row: Record<string, unknown>) => ({
      id: String(row.id),
      florist_id: floristId,
      content: String(row.content ?? ""),
      sort_order: Number(row.sort_order ?? 1),
      created_at: (row.created_at ?? null) as string | null,
    })) ?? []
  const mappedStats =
    (stats ?? []).map((row: Record<string, unknown>) => ({
      id: String(row.id),
      florist_id: floristId,
      label: String(row.label ?? ""),
      value: String(row.value ?? ""),
      sort_order: Number(row.sort_order ?? 1),
      created_at: (row.created_at ?? null) as string | null,
    })) ?? []

  const fallbackParagraphs =
    base.description || base.content
      ? [
          {
            id: "legacy",
            florist_id: floristId,
            content: String(base.description ?? base.content ?? ""),
            sort_order: 1,
          },
        ]
      : []

  return {
    ...base,
    paragraphs: mappedParagraphs.length > 0 ? mappedParagraphs : fallbackParagraphs,
    stats: mappedStats.length > 0 ? mappedStats : base.stats,
  }
}

export async function getContactMethods(): Promise<ContactMethod[]> {
  const floristId = getFloristId()
  if (!floristId) return []

  const supabase = await createClient()
  const { data } = await supabase
    .from("contact_methods")
    .select("*")
    .eq("florist_id", floristId)
    .order("position")
  return data ?? []
}

export async function getSocialLinks(): Promise<SocialLink[]> {
  const floristId = getFloristId()
  if (!floristId) return []

  const supabase = await createClient()
  const { data } = await supabase
    .from("social_links")
    .select("*")
    .eq("florist_id", floristId)
    .eq("is_active", true)
    .order("display_order")
  return data ?? []
}

// ── Aggregate fetch for the full page ────────────────────

export async function getFloristFullData(): Promise<FloristFullData | null> {
  const florist = await getFlorist()
  if (!florist) return null

  const [slides, categories, products, paymentMethods, about, contactMethods, socialLinks] =
    await Promise.all([
      getHeroSlides(),
      getCategories(),
      getProducts(),
      getPaymentMethods(),
      getAboutSection(),
      getContactMethods(),
      getSocialLinks(),
    ])

  return {
    florist,
    slides,
    categories,
    products,
    paymentMethods,
    about,
    contactMethods,
    socialLinks,
  }
}
