import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const ALLOWED_FUNCTIONS = new Set([
  "sp_get_florist",
  "sp_admin_exists",
  "sp_admin_register",
  "sp_admin_login",
  "sp_admin_change_password",
  "sp_list_categories",
  "sp_list_products",
  "sp_list_payment_methods",
  "sp_list_mobile_payment_providers",
  "sp_upsert_payment_method",
  "sp_delete_payment_method",
  "sp_list_contact_methods",
  "sp_replace_contact_methods",
  "sp_list_social_links",
  "sp_replace_social_links",
  "sp_get_about_section",
  "sp_list_about_paragraphs",
  "sp_list_about_stats",
  "sp_upsert_about_section",
  "sp_replace_about_paragraphs",
  "sp_replace_about_stats",
  "sp_upsert_category",
  "sp_upsert_product",
  "sp_upsert_mobile_payment_provider",
  "sp_delete_category",
  "sp_delete_product",
  "sp_delete_provider",
])

export async function POST(req: Request) {
  const body = await req.json()
  const fn = String(body?.fn ?? "")
  const args = (body?.args ?? {}) as Record<string, unknown>

  if (!ALLOWED_FUNCTIONS.has(fn)) {
    return NextResponse.json({ error: { message: "RPC not allowed" } }, { status: 400 })
  }

  const floristId = process.env.NEXT_PUBLIC_FLORIST_ID
  const argFloristId = args.p_florist_id as string | undefined
  if (floristId && argFloristId && argFloristId !== floristId) {
    return NextResponse.json({ error: { message: "Invalid florist id" } }, { status: 403 })
  }

  const supabase = await createClient()
  const { data, error } = await supabase.rpc(fn, args)
  if (error) {
    return NextResponse.json({ error }, { status: 400 })
  }
  return NextResponse.json({ data })
}
