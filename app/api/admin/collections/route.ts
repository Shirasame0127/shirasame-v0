import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { getOwnerUserId } from '@/lib/owner'

function makeId() {
  return `col-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function mapPayloadToDb(payload: any) {
  return {
    id: payload.id || makeId(),
    user_id: payload.userId || payload.user_id || null,
    title: payload.title,
    description: payload.description || null,
    visibility: payload.visibility || "public",
    created_at: payload.createdAt || payload.created_at || new Date().toISOString(),
    updated_at: payload.updatedAt || payload.updated_at || new Date().toISOString(),
  }
}

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("collections")
      .select("*, collection_items(count)")
      .order("created_at", { ascending: false })
    if (error) {
      console.error("[admin/collections] GET error", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform to camelCase response expected by frontend
    const transformed = (data || []).map((c: any) => ({
      id: c.id,
      userId: c.user_id,
      title: c.title,
      description: c.description,
      visibility: c.visibility,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
      itemCount: Array.isArray(c.collection_items) && c.collection_items[0]?.count != null
        ? c.collection_items[0].count
        : 0,
    }))

    return NextResponse.json({ data: transformed })
  } catch (e: any) {
    console.error("[admin/collections] GET exception", e)
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    // Prevent creating collections that are reserved for major Amazon sales via this endpoint.
    const RESERVED_SALE_NAMES = [
      "プライムデー",
      "ブラックフライデー",
      "サイバーマンデー",
      "初売りセール",
      "新生活セール",
      "ゴールデンウィークセール",
      "夏のビッグセール",
      "年末の贈り物セール",
      "その他のセール",
    ]
    if (body && typeof body.title === 'string' && RESERVED_SALE_NAMES.includes(body.title)) {
      return NextResponse.json({ error: '大型セール用コレクションはセールスケジュール登録でのみ作成してください' }, { status: 403 })
    }
    const row = mapPayloadToDb(body)
    try {
      const ownerUserId = await getOwnerUserId()
      row.user_id = ownerUserId
    } catch (ownerErr: any) {
      console.error('[admin/collections] failed to resolve owner user id', ownerErr)
      return NextResponse.json({ error: 'owner resolution failed' }, { status: 500 })
    }

    const { data, error } = await supabaseAdmin.from("collections").insert([row]).select().single()
    if (error) {
      console.error("[admin/collections] POST error", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const c = data
    const transformed = {
      id: c.id,
      userId: c.user_id,
      title: c.title,
      description: c.description,
      visibility: c.visibility,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
    }

    return NextResponse.json({ data: transformed })
  } catch (e: any) {
    console.error("[admin/collections] POST exception", e)
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}
