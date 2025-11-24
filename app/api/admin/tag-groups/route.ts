import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { getOwnerUserId } from '@/lib/owner'

// 管理用: タググループの一覧取得・作成・更新・削除を提供します

export async function GET() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ data: [] })
  }
  // Only return tag_groups for the configured owner
  let ownerUserId: string | null = null
  try {
    ownerUserId = await getOwnerUserId()
  } catch (oe) {
    console.error('[v0] failed to resolve owner for admin tag_groups', oe)
    return NextResponse.json({ data: [] })
  }

  // Try owner-scoped query; fall back if user_id column absent
  try {
    const ownerRes = await supabaseAdmin
      .from("tag_groups")
      .select("name, label, sort_order, created_at")
      .eq('user_id', ownerUserId)
      .order("sort_order", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: true })

    if (ownerRes.error) {
      const msg = String(ownerRes.error.message || "")
      if (msg.includes('user_id') || msg.includes('column') || msg.includes('does not exist')) {
        console.warn('[v0] admin tag_groups owner query failed, falling back', ownerRes.error)
        const fallback = await supabaseAdmin
          .from("tag_groups")
          .select("name, label, sort_order, created_at")
          .order("sort_order", { ascending: true, nullsFirst: false })
          .order("created_at", { ascending: true })
        if (fallback.error) {
          console.error('[v0] failed to fetch tag_groups (admin fallback)', fallback.error)
          return NextResponse.json({ data: [] })
        }
        return NextResponse.json({ data: fallback.data })
      }
      console.error("[v0] failed to fetch tag_groups", ownerRes.error)
      return NextResponse.json({ data: [] })
    }

    return NextResponse.json({ data: ownerRes.data })
  } catch (e: any) {
    console.error('[v0] unexpected error fetching admin tag_groups', e)
    return NextResponse.json({ data: [] })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    const name = body?.name
    const label = body?.label || null
    if (!name) return NextResponse.json({ ok: false, error: "name required" }, { status: 400 })

    const ownerUserId = await getOwnerUserId()
    const { error } = await supabaseAdmin.from("tag_groups").upsert([{ name, label, user_id: ownerUserId }], { onConflict: "name" })
    if (error) {
      console.error("[v0] failed to upsert tag_group", error)
      return NextResponse.json({ ok: false, error: error.message || "failed" }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    const name = body?.name
    const newName = body?.newName
    const label = body?.label
    if (!name || !newName) return NextResponse.json({ ok: false, error: "name and newName required" }, { status: 400 })

    // update name (primary key) is not straightforward; perform transactional-ish approach:
    // 1) insert new row
    // 2) update tags table's group value
    // 3) delete old row

    const ownerUserId = await getOwnerUserId()
    const { error: insErr } = await supabaseAdmin.from("tag_groups").upsert([{ name: newName, label, user_id: ownerUserId }], { onConflict: "name" })
    if (insErr) {
      console.error("[v0] failed to insert new tag_group", insErr)
      return NextResponse.json({ ok: false, error: insErr.message || "failed" }, { status: 500 })
    }

    // only update the tags belonging to the owner
    const { error: updTagsErr } = await supabaseAdmin.from("tags").update({ group: newName }).eq("group", name).eq('user_id', ownerUserId)
    if (updTagsErr) {
      console.error("[v0] failed to update tags group", updTagsErr)
      return NextResponse.json({ ok: false, error: updTagsErr.message || "failed" }, { status: 500 })
    }

    const { error: delErr } = await supabaseAdmin.from("tag_groups").delete().eq("name", name).eq('user_id', ownerUserId)
    if (delErr) {
      console.error("[v0] failed to delete old tag_group", delErr)
      return NextResponse.json({ ok: false, error: delErr.message || "failed" }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    const name = body?.name
    if (!name) return NextResponse.json({ ok: false, error: "name required" }, { status: 400 })

    // remove association from tags first
    const ownerUserId2 = await getOwnerUserId()
    const { error: updErr } = await supabaseAdmin.from("tags").update({ group: null }).eq("group", name).eq('user_id', ownerUserId2)
    if (updErr) {
      console.error("[v0] failed to unset tags group", updErr)
      return NextResponse.json({ ok: false, error: updErr.message || "failed" }, { status: 500 })
    }

    const { error: delErr } = await supabaseAdmin.from("tag_groups").delete().eq("name", name).eq('user_id', ownerUserId2)
    if (delErr) {
      console.error("[v0] failed to delete tag_group", delErr)
      return NextResponse.json({ ok: false, error: delErr.message || "failed" }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 })
  }
}
