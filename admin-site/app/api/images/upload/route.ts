import { NextResponse } from "next/server"
import supabaseAdmin from "@/lib/supabase"
import { getOwnerUserId } from '@/lib/owner'

export async function POST(req: Request) {
  try {
    console.log('[api/images/upload] request received')
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    if (!file) return NextResponse.json({ error: "file is required" }, { status: 400 })

    const fileName = (file as File).name || `upload-${Date.now()}`

    // Prefer Worker proxy to R2 (CASE A)
    try {
      const workerBase = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || ''
      if (workerBase) {
        const fd = new FormData()
        fd.append('file', file)
        const res = await fetch(`${workerBase.replace(/\/$/, '')}/upload-image`, { method: 'POST', body: fd })
        if (res.ok) {
          const json = await res.json().catch(() => ({}))
          // Return publicUrl to client (必須)
          return NextResponse.json({ ok: true, result: { publicUrl: json?.result?.publicUrl, key: json?.result?.key } })
        }
        // if worker returns error, continue fallback below
        const errTxt = await res.text().catch(() => '')
        console.warn('[api/images/upload] worker upload failed', res.status, errTxt)
      }
    } catch (e) {
      console.warn('[api/images/upload] worker proxy failed', e)
    }

    // Simple fallback: if no R2/CF credentials, attempt to persist minimal metadata to supabase 'images' table if available
    try {
      const ownerUserId2 = await getOwnerUserId().catch(() => null)
      const insertObj: any = {
        filename: fileName,
        url: null,
        metadata: { note: 'uploaded-via-dev-stub' },
        user_id: ownerUserId2,
      }
      if (supabaseAdmin) {
        const { data, error } = await supabaseAdmin.from('images').insert([insertObj]).select().maybeSingle()
        if (error) console.warn('[api/images/upload] supabase insert warning', error)
        return NextResponse.json({ ok: true, result: { url: null, info: 'metadata-saved', inserted: data } }, { status: 200 })
      }
    } catch (e) {
      console.warn('[api/images/upload] fallback path failed', e)
    }

    return NextResponse.json({ error: 'No upload backend configured in dev environment' }, { status: 500 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "internal" }, { status: 500 })
  }
}
