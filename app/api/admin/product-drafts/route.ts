import { NextResponse } from "next/server"
import supabaseAdmin from "@/lib/supabase"
import { getOwnerUserId } from '@/lib/owner'

export async function GET(req: Request) {
  let ownerUserId: string | null = null
  try {
    ownerUserId = await getOwnerUserId()
  } catch (oe) {
    console.error('[admin/product_drafts] failed to resolve owner', oe)
    return NextResponse.json({ error: 'owner resolution failed' }, { status: 500 })
  }

  const { data, error } = await supabaseAdmin.from("product_drafts").select("data, updated_at").eq("user_id", ownerUserId).maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ data: null })
  return NextResponse.json({ data: data.data, updatedAt: data.updated_at })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { data } = body
    let ownerUserId: string | null = null
    try {
      ownerUserId = await getOwnerUserId()
    } catch (oe) {
      console.error('[admin/product_drafts] failed to resolve owner', oe)
      return NextResponse.json({ error: 'owner resolution failed' }, { status: 500 })
    }

    const payload = {
      user_id: ownerUserId,
      data,
      updated_at: new Date().toISOString(),
    }

    const { data: upserted, error } = await supabaseAdmin
      .from("product_drafts")
      .upsert(payload, { onConflict: "user_id" })
      .select("data, updated_at")
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data: upserted?.data, updatedAt: upserted?.updated_at })
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json()
    let ownerUserId: string | null = null
    try {
      ownerUserId = await getOwnerUserId()
    } catch (oe) {
      console.error('[admin/product_drafts] failed to resolve owner', oe)
      return NextResponse.json({ error: 'owner resolution failed' }, { status: 500 })
    }

    const { error } = await supabaseAdmin.from("product_drafts").delete().eq("user_id", ownerUserId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 })
  }
}
