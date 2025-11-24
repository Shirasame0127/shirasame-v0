import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { getOwnerUserId } from '@/lib/owner'

const AMAZON_MAJOR_SALES = [
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

function makeCollectionId() {
  return `col-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function mapRowToClient(r: any) {
  return {
    id: r.id,
    userId: r.user_id,
    saleName: r.sale_name,
    startDate: r.start_date,
    endDate: r.end_date,
    collectionId: r.collection_id,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }
}

export async function GET() {
  try {
    // Only return schedules owned by the configured owner
    let ownerUserId: string | null = null
    try {
      ownerUserId = await getOwnerUserId()
    } catch (oe) {
      console.error('[admin/amazon-sale-schedules] failed to resolve owner for GET', oe)
      return NextResponse.json({ error: 'owner resolution failed' }, { status: 500 })
    }

    // attempt owner-scoped query first; fall back if column missing
    const ownerRes = await supabaseAdmin
      .from("amazon_sale_schedules")
      .select("*")
      .eq('user_id', ownerUserId)
      .order("created_at", { ascending: false })

    let rows: any[] = []
    if (ownerRes.error) {
      const msg = String(ownerRes.error.message || "")
      if (msg.includes('user_id') || msg.includes('column') || msg.includes('does not exist')) {
        console.warn('[admin/amazon-sale-schedules] owner-scoped GET failed, falling back', ownerRes.error)
        const fallback = await supabaseAdmin.from("amazon_sale_schedules").select("*").order("created_at", { ascending: false })
        if (fallback.error) {
          console.error("[admin/amazon-sale-schedules] GET error (fallback)", fallback.error)
          return NextResponse.json({ error: fallback.error.message }, { status: 500 })
        }
        rows = fallback.data || []
      } else {
        console.error("[admin/amazon-sale-schedules] GET error", ownerRes.error)
        return NextResponse.json({ error: ownerRes.error.message }, { status: 500 })
      }
    } else {
      rows = ownerRes.data || []
    }

    const transformed = (rows || []).map(mapRowToClient)
    return NextResponse.json({ data: transformed })
  } catch (e: any) {
    console.error("[admin/amazon-sale-schedules] GET exception", e)
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    let body: any
    try {
      body = await req.json()
    } catch (parseErr) {
      // read raw body for debugging
      let raw = null
      try {
        raw = await req.text()
      } catch (_) {
        raw = null
      }
      console.error("[admin/amazon-sale-schedules] JSON parse error", parseErr, "rawBody:", raw)
      return NextResponse.json({ error: `Invalid JSON: ${String(parseErr?.message || parseErr)}`, rawBody: raw }, { status: 400 })
    }

    const { saleName, startDate, endDate, userId } = body
    if (!saleName || !startDate || !endDate) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 })
    }

    // Create collection for the sale
    // Basic date validation
    const start = new Date(startDate)
    const end = new Date(endDate)
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json({ error: "開始日または終了日の形式が不正です" }, { status: 400 })
    }
    if (end <= start) {
      return NextResponse.json({ error: "終了日は開始日より後にしてください" }, { status: 400 })
    }

    // Prevent duplicate active schedules of same sale_name overlapping
    const { data: existing, error: existingErr } = await supabaseAdmin
      .from("amazon_sale_schedules")
      .select("*")
      .eq("sale_name", saleName)
      .order("start_date", { ascending: true })

    if (!existingErr && Array.isArray(existing)) {
      const overlap = existing.find((s: any) => {
        const sStart = new Date(s.start_date)
        const sEnd = new Date(s.end_date)
        return (start <= sEnd && end >= sStart) // time ranges intersect
      })
      if (overlap) {
        return NextResponse.json({ error: "同じセール名の重複期間があります" }, { status: 409 })
      }
    }

    const nowIso = new Date().toISOString()
    // Force collection ownership to configured owner
    let ownerUserId: string | null = null
    try {
      ownerUserId = await getOwnerUserId()
    } catch (oe) {
      console.error('[admin/amazon-sale-schedules] failed to resolve owner', oe)
      return NextResponse.json({ error: 'owner resolution failed' }, { status: 500 })
    }

    const collectionRow = {
      id: makeCollectionId(),
      title: saleName,
      description: `${saleName}期間中のセール商品`,
      visibility: "public",
      user_id: ownerUserId,
      created_at: nowIso,
      updated_at: nowIso,
    }

    const { data: colData, error: colErr } = await supabaseAdmin
      .from("collections")
      .insert([collectionRow])
      .select()
      .single()

    if (colErr || !colData) {
      // Specific missing-table handling
      if ((colErr as any)?.code === 'PGRST205') {
        return NextResponse.json({ error: "DBにcollectionsテーブルが存在しません。マイグレーションを適用してください" }, { status: 500 })
      }
      console.error("[admin/amazon-sale-schedules] create collection error", colErr)
      return NextResponse.json({ error: colErr?.message || "コレクション作成に失敗しました" }, { status: 500 })
    }

    const scheduleRow = {
      sale_name: saleName,
      start_date: startDate,
      end_date: endDate,
      collection_id: colData.id,
      user_id: ownerUserId,
    }

    const { data: schedData, error: schedErr } = await supabaseAdmin
      .from("amazon_sale_schedules")
      .insert([scheduleRow])
      .select()
      .single()

    if (schedErr || !schedData) {
      // rollback collection (only delete if collection owned by owner)
      await supabaseAdmin.from("collections").delete().eq("id", colData.id).eq('user_id', ownerUserId)
      if ((schedErr as any)?.code === 'PGRST205') {
        return NextResponse.json({ error: "DBにamazon_sale_schedulesテーブルが存在しません。`sql/create_amazon_sale_schedules.sql` を適用してください" }, { status: 500 })
      }
      console.error("[admin/amazon-sale-schedules] create schedule error", schedErr)
      return NextResponse.json({ error: schedErr?.message || "セールスケジュール作成に失敗しました" }, { status: 500 })
    }

    return NextResponse.json({ data: mapRowToClient(schedData) })
  } catch (e: any) {
    console.error("[admin/amazon-sale-schedules] POST exception", e)
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: any }) {
  try {
    const maybeParams = params && typeof (params as any).then === 'function' ? await params : params
    const id = maybeParams?.id || (params && (params as any).id)
    if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 })

    // find schedule to get collection id
    const { data: existing } = await supabaseAdmin.from("amazon_sale_schedules").select("*").eq("id", id).single()
    const collectionId = existing?.collection_id

    // Restrict delete to schedules owned by the configured owner
    let ownerUserIdDel: string | null = null
    try {
      ownerUserIdDel = await getOwnerUserId()
    } catch (oe) {
      console.error('[admin/amazon-sale-schedules] failed to resolve owner for delete', oe)
      return NextResponse.json({ error: 'owner resolution failed' }, { status: 500 })
    }

    const { error: delErr } = await supabaseAdmin.from("amazon_sale_schedules").delete().eq("id", id).eq('user_id', ownerUserIdDel)
    if (delErr) {
      console.error("[admin/amazon-sale-schedules] delete schedule error", delErr)
      return NextResponse.json({ error: delErr.message }, { status: 500 })
    }

    if (collectionId) {
      await supabaseAdmin.from("collections").delete().eq("id", collectionId).eq('user_id', ownerUserIdDel)
    }

    return NextResponse.json({ data: { id } })
  } catch (e: any) {
    console.error("[admin/amazon-sale-schedules] DELETE exception", e)
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}
