import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { getOwnerUserId } from '@/lib/owner'

export async function GET() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ data: [] })
  }
  // Only expose tag_groups belonging to configured owner
  let ownerUserId: string | null = null
  try {
    ownerUserId = await getOwnerUserId()
  } catch (oe) {
    console.error('[v0] failed to resolve owner for tag_groups', oe)
    return NextResponse.json({ data: [] })
  }

  // Try owner-scoped query; if DB doesn't have user_id column, fall back to global
  let data: any = []
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
        console.warn('[v0] owner-scoped tag_groups query failed, falling back to global query', ownerRes.error)
        const fallback = await supabaseAdmin
          .from("tag_groups")
          .select("name, label, sort_order, created_at")
          .order("sort_order", { ascending: true, nullsFirst: false })
          .order("created_at", { ascending: true })
        if (fallback.error) {
          console.error('[v0] failed to fetch tag_groups (public fallback)', fallback.error)
          return NextResponse.json({ data: [] })
        }
        data = fallback.data
      } else {
        console.error('[v0] failed to fetch tag_groups (public)', ownerRes.error)
        return NextResponse.json({ data: [] })
      }
    } else {
      data = ownerRes.data
    }
  } catch (e: any) {
    console.error('[v0] unexpected error fetching tag_groups', e)
    return NextResponse.json({ data: [] })
  }

  return NextResponse.json({ data })
}
