import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { getOwnerUserId } from '@/lib/owner'

export async function GET() {
  try {
    const hasUrl = !!process.env.SUPABASE_URL
    const hasKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!hasUrl || !hasKey) {
      return NextResponse.json({ ok: false, env: { SUPABASE_URL: hasUrl, SUPABASE_SERVICE_ROLE_KEY: hasKey }, error: "supabase env not configured" }, { status: 500 })
    }

    const ownerUserId = await getOwnerUserId()
    const { data, error } = await supabaseAdmin.from("tags").select("id, name").eq('user_id', ownerUserId)
    if (error) {
      return NextResponse.json({ ok: false, env: { SUPABASE_URL: hasUrl, SUPABASE_SERVICE_ROLE_KEY: hasKey }, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, env: { SUPABASE_URL: hasUrl, SUPABASE_SERVICE_ROLE_KEY: hasKey }, count: Array.isArray(data) ? data.length : 0, sample: (data || []).slice(0, 10) })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 })
  }
}
