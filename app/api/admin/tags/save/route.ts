import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import type { Tag } from "@/lib/db/schema"
import { getOwnerUserId } from '@/lib/owner'

// 管理用: 受け取った tags 配列で DB を同期する
// フロー:
// 1) 既存 tags の id を取得
// 2) 受信 tags に存在しない id を削除
// 3) 受信 tags を upsert (on conflict id)
// 4) タグが参照するグループ名は tag_groups テーブルに upsert

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    const tags = (body?.tags || []) as Tag[]

    if (!Array.isArray(tags)) {
      return NextResponse.json({ ok: false, error: "invalid tags" }, { status: 400 })
    }

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("[v0] Supabase env not configured")
      return NextResponse.json({ ok: false, error: "supabase not configured" }, { status: 500 })
    }

    // 1) 既存 id を取得（オーナーのタグのみ）
    const ownerUserId = await getOwnerUserId()
    const { data: existing, error: selError } = await supabaseAdmin.from("tags").select("id").eq('user_id', ownerUserId)
    if (selError) {
      console.error("[v0] failed to fetch existing tags", selError)
      return NextResponse.json({ ok: false, error: selError.message || "failed to fetch existing tags" }, { status: 500 })
    }

    const existingIds = (existing || []).map((r: any) => r.id)
    const newIds = tags.map((t) => t.id)
    const idsToDelete = existingIds.filter((id: string) => !newIds.includes(id))

    // 2) 不要な行を削除
    if (idsToDelete.length > 0) {
      const { error: delError } = await supabaseAdmin.from("tags").delete().in("id", idsToDelete).eq('user_id', ownerUserId)
      if (delError) {
        console.error("[v0] failed to delete tags", delError)
        return NextResponse.json({ ok: false, error: delError.message || "failed to delete tags" }, { status: 500 })
      }
    }

    // 同時に、タグに含まれるグループ名を tag_groups テーブルに upsert しておく
    try {
      const groupNames = Array.from(new Set(tags.map((t) => (t.group || "")).filter(Boolean)))
      if (groupNames.length > 0) {
        // Attempt to upsert tag_groups with owner user_id; if DB schema lacks user_id, fall back
        const rowsWithOwner = groupNames.map((name) => ({ name, label: name, user_id: ownerUserId }))
        try {
          const { error: grpErr } = await supabaseAdmin.from("tag_groups").upsert(rowsWithOwner, { onConflict: "name" })
          if (grpErr) {
            const msg = String(grpErr.message || "")
            if (msg.includes('user_id') || msg.includes('column') || msg.includes('does not exist')) {
              console.warn('[v0] tag_groups upsert with user_id failed, retrying without user_id', grpErr)
              const fallbackRows = groupNames.map((name) => ({ name, label: name }))
              const { error: fallbackErr } = await supabaseAdmin.from("tag_groups").upsert(fallbackRows, { onConflict: "name" })
              if (fallbackErr) console.error('[v0] tag_groups upsert fallback failed', fallbackErr)
            } else {
              console.error("[v0] failed to upsert tag_groups", grpErr)
            }
          }
        } catch (e) {
          // If the upsert threw (driver-level), try fallback without user_id
          console.warn('[v0] tag_groups upsert threw, retrying without user_id', e)
          const fallbackRows = groupNames.map((name) => ({ name, label: name }))
          const { error: fallbackErr } = await supabaseAdmin.from("tag_groups").upsert(fallbackRows, { onConflict: "name" })
          if (fallbackErr) console.error('[v0] tag_groups upsert fallback failed', fallbackErr)
        }
      }
    } catch (e) {
      console.error("[v0] tag_groups upsert error", e)
    }

    // 3) upsert で挿入/更新（created_at は DB 側デフォルトを使う）
    if (tags.length > 0) {
      const rows = tags.map((t) => ({
        id: t.id,
        name: t.name,
        group: t.group ?? null,
        link_url: t.linkUrl ?? null,
        link_label: t.linkLabel ?? null,
        user_id: ownerUserId,
      }))

      const { error: upsertError } = await supabaseAdmin.from("tags").upsert(rows, { onConflict: "id" })
      if (upsertError) {
        console.error("[v0] failed to upsert tags", upsertError)
        return NextResponse.json({ ok: false, error: upsertError.message || "failed to upsert tags" }, { status: 500 })
      }
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error("[v0] admin tags save error", e)
    return NextResponse.json({ ok: false, error: e?.message || "failed to save tags" }, { status: 500 })
  }
}
