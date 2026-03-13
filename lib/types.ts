// ── Database types matching Supabase schema ──────────────

export interface Florist {
  id: string
  name: string
  tagline?: string | null
  description?: string | null
  whatsapp_number?: string | null
  email?: string | null
  address?: string | null
  business_hours?: string | null
  logo_url?: string | null
  phone?: string | null
  latitude?: number | null
  longitude?: number | null
  theme?: Record<string, unknown> | null
  active?: boolean | null
  created_at?: string | null
  updated_at?: string | null
}

export interface HeroSlide {
  id: string
  florist_id: string
  image_url: string
  title: string | null
  subtitle?: string | null
  description?: string | null
  display_order?: number | null
  sort_order?: number | null
  is_active?: boolean | null
  active?: boolean | null
  created_at?: string | null
}

export interface Category {
  id: string
  florist_id: string
  name: string
  description?: string | null
  image_url?: string | null
  display_order?: number | null
  sort_order?: number | null
  is_active?: boolean | null
  active?: boolean | null
  created_at?: string | null
}

export interface Product {
  id: string
  category_id?: string
  name: string
  description?: string | null
  price: number
  image_url?: string | null
  is_active?: boolean | null
  active?: boolean | null
  created_at?: string | null
  updated_at?: string | null
  // joined field
  category_name?: string
}

export interface PaymentMethod {
  id: string
  florist_id: string
  code?: string | null
  name: string
  description?: string | null
  icon?: string | null
  is_active?: boolean | null
  active?: boolean | null
  display_order?: number | null
  sort_order?: number | null
  created_at?: string | null
  providers?: MobilePaymentProvider[]
}

export interface MobilePaymentProvider {
  id: string
  florist_id?: string | null
  payment_method_id?: string | null
  name: string
  qr_code_url?: string | null
  qr_image_url?: string | null
  is_active?: boolean | null
  active?: boolean | null
  display_order?: number | null
  sort_order?: number | null
  created_at?: string | null
}

export interface AboutSection {
  id: string
  florist_id: string
  title?: string | null
  description?: string | null
  content?: string | null
  image_url?: string | null
  years_experience?: number | null
  products_count?: number | null
  handmade_percentage?: number | null
  created_at?: string | null
  paragraphs?: AboutParagraph[]
  stats?: AboutStat[]
}

export interface AboutParagraph {
  id: string
  florist_id: string
  content: string
  sort_order: number
  created_at?: string | null
}

export interface AboutStat {
  id: string
  florist_id: string
  label: string
  value: string
  sort_order: number
  created_at?: string | null
}

export interface ContactMethod {
  id: string
  florist_id: string
  type: string
  value: string
  icon?: string | null
  position?: number | null
  display_order?: number | null
  sort_order?: number | null
  is_active?: boolean | null
  active?: boolean | null
  created_at?: string | null
}

export interface SocialLink {
  id: string
  florist_id: string
  platform: string
  url: string
  icon?: string | null
  display_order?: number | null
  sort_order?: number | null
  is_active?: boolean | null
  active?: boolean | null
  created_at?: string | null
}

// ── Aggregated data fetched for a florist ────────────────

export interface FloristFullData {
  florist: Florist
  slides: HeroSlide[]
  categories: Category[]
  products: Product[]
  paymentMethods: PaymentMethod[]
  about: AboutSection | null
  contactMethods: ContactMethod[]
  socialLinks: SocialLink[]
}
