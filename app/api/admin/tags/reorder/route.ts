import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { getOwnerUserId } from '@/lib/owner'

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    const tags = Array.isArray(body?.tags) ? body.tags : []
    if (!Array.isArray(tags)) return NextResponse.json({ ok: false, error: "invalid payload" }, { status: 400 })

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ ok: false, error: "supabase not configured" }, { status: 500 })
    }

    const ownerUserId = await getOwnerUserId()
    for (const t of tags) {
      const id = t.id
      const order = Number(t.order) || 0
      const group = t.group ?? null
      const { error } = await supabaseAdmin.from("tags").update({ sort_order: order, group }).eq("id", id).eq('user_id', ownerUserId)
      if (error) {
        console.error("[v0] failed to update tag order", error)
        return NextResponse.json({ ok: false, error: error.message || "failed to update tag" }, { status: 500 })
      }
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error("[v0] tags reorder error", e)
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 })
  }
}
