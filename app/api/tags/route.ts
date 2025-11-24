import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

// 公開タグ一覧API: Supabase の tags テーブルから取得（sort_order を尊重）
export async function GET() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ data: [] })
  }

  const { data, error } = await supabaseAdmin
    .from("tags")
    .select("id, name, group, link_url, link_label, user_id, sort_order, created_at")
    .order("sort_order", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true })

  if (error) {
    console.error("[v0] failed to fetch tags", error)
    return NextResponse.json({ data: [] })
  }

  const mapped = (data || []).map((row: any) => ({
    id: row.id,
    name: row.name,
    group: row.group ?? undefined,
    linkUrl: row.link_url ?? undefined,
    linkLabel: row.link_label ?? undefined,
    userId: row.user_id ?? undefined,
    sortOrder: row.sort_order ?? 0,
    createdAt: row.created_at,
  }))

  return NextResponse.json({ data: mapped })
}

