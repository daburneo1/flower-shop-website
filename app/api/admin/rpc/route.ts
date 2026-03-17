import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const PUBLIC_FUNCTIONS = new Set([
  "sp_get_florist",
  "sp_admin_exists",
])

const AUTH_FUNCTIONS = new Set([
  "sp_admin_bootstrap",
  "sp_admin_me",
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
  "sp_upsert_florist_location",
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

const ALLOWED_FUNCTIONS = new Set([
  ...PUBLIC_FUNCTIONS,
  ...AUTH_FUNCTIONS,
])

export async function POST(req: Request) {
  try {
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

    if (AUTH_FUNCTIONS.has(fn)) {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 })
      }

      if (fn !== "sp_admin_bootstrap") {
        const { data: adminRows, error: adminError } = await supabase
            .from("admins")
            .select("auth_user_id, florist_id, active")
            .eq("auth_user_id", user.id)
            .eq("florist_id", floristId)
            .eq("active", true)
            .limit(1)

        if (adminError || !adminRows || adminRows.length === 0) {
          return NextResponse.json({ error: { message: "Forbidden" } }, { status: 403 })
        }
      }
    }

    const { data, error } = await supabase.rpc(fn, args)

    if (error) {
      return NextResponse.json({ error }, { status: 400 })
    }

    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: { message: "Invalid request" } }, { status: 400 })
  }
}