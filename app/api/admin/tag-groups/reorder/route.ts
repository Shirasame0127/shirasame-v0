import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { getOwnerUserId } from '@/lib/owner'

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    const groups = Array.isArray(body?.groups) ? body.groups : []
    if (!Array.isArray(groups)) return NextResponse.json({ ok: false, error: "invalid payload" }, { status: 400 })

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ ok: false, error: "supabase not configured" }, { status: 500 })
    }

    const ownerUserId = await getOwnerUserId()
    for (const g of groups) {
      const name = g.name
      const order = Number(g.order) || 0
      // attempt owner-scoped update first
      const res = await supabaseAdmin.from("tag_groups").update({ sort_order: order }).eq("name", name).eq('user_id', ownerUserId)
      if (res.error) {
        const msg = String(res.error.message || "")
        if (msg.includes('user_id') || msg.includes('column') || msg.includes('does not exist')) {
          console.warn('[v0] tag_groups reorder owner update failed, falling back to global update', res.error)
          const fallback = await supabaseAdmin.from("tag_groups").update({ sort_order: order }).eq("name", name)
          if (fallback.error) {
            console.error("[v0] failed to update tag_group order (fallback)", fallback.error)
            return NextResponse.json({ ok: false, error: fallback.error.message || "failed to update" }, { status: 500 })
          }
        } else {
          console.error("[v0] failed to update tag_group order", res.error)
          return NextResponse.json({ ok: false, error: res.error.message || "failed to update" }, { status: 500 })
        }
      }
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error("[v0] tag-groups reorder error", e)
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 })
  }
}
