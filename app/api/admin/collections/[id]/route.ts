import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { getOwnerUserId } from '@/lib/owner'

export async function GET(req: Request, { params }: { params: any }) {
  try {
    const maybeParams = params && typeof (params as any).then === 'function' ? await params : params
    const id = maybeParams?.id || (params && (params as any).id)
    const { data, error } = await supabaseAdmin.from("collections").select("*").eq("id", id).maybeSingle()
    if (error) {
      console.error("[admin/collections:id] GET error", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    if (!data) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 })
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
    console.error("[admin/collections:id] GET exception", e)
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: any }) {
  try {
    const maybeParams = params && typeof (params as any).then === 'function' ? await params : params
    const id = maybeParams?.id || (params && (params as any).id)

    // Resolve owner and restrict updates to owner's collections
    let ownerUserId: string | null = null
    try {
      ownerUserId = await getOwnerUserId()
    } catch (oe) {
      console.error('[admin/collections:id] failed to resolve owner', oe)
      return NextResponse.json({ error: 'owner resolution failed' }, { status: 500 })
    }
    const body = await req.json()
    const update = {
      title: body.title,
      description: body.description ?? null,
      visibility: body.visibility ?? "public",
      updated_at: new Date().toISOString(),
    }
    const { data, error } = await supabaseAdmin.from("collections").update(update).eq("id", id).eq('user_id', ownerUserId).select().maybeSingle()
    if (error) {
      console.error("[admin/collections:id] PUT error", error)
      return NextResponse.json({ error: error?.message || 'update failed' }, { status: 500 })
    }
    if (!data) {
      console.warn("[admin/collections:id] PUT no rows updated for id", id)
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 })
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
    console.error("[admin/collections:id] PUT exception", e)
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Resolve owner and restrict delete to owner's collections
    let ownerUserId: string | null = null
    try {
      ownerUserId = await getOwnerUserId()
    } catch (oe) {
      console.error('[admin/collections:id] failed to resolve owner', oe)
      return NextResponse.json({ error: 'owner resolution failed' }, { status: 500 })
    }

    const { error } = await supabaseAdmin.from("collections").delete().eq("id", id).eq('user_id', ownerUserId)
    if (error) {
      console.error("[admin/collections:id] DELETE error", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error("[admin/collections:id] DELETE exception", e)
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}
