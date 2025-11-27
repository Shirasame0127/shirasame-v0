import { NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabase'

const hasSupabase = !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)

export async function GET() {
  // Be tolerant in dev: if Supabase isn't configured, return empty settings (200)
  if (!hasSupabase) {
    return NextResponse.json({ data: {} })
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('site_settings')
      .select('key, value')
      .limit(100)

    if (error) {
      console.error('site-settings GET error', error)
      // Return 200 with empty payload so clients' warmCache won't throw
      return NextResponse.json({ data: {} })
    }

    // Ensure we handle non-array responses safely (some drivers may return objects)
    const rows = Array.isArray(data) ? data : []
    const out: Record<string, any> = {}
    rows.forEach((r: any) => {
      try {
        if (r && typeof r.key === 'string') out[r.key] = r.value
      } catch (e) {
        console.warn('site-settings: skipping invalid row', r, e)
      }
    })

    return NextResponse.json({ data: out })
  } catch (err) {
    console.error('site-settings GET exception', err)
    return NextResponse.json({ data: {} })
  }
}

export async function POST(req: Request) {
  // If Supabase not configured, accept the call but respond with not-configured
  if (!hasSupabase) {
    const body = await req.json().catch(() => null)
    const key = body?.key || null
    return NextResponse.json({ ok: false, error: 'supabase not configured', key })
  }

  try {
    const body = await req.json().catch(() => null)
    if (!body || !body.key) {
      return NextResponse.json({ error: 'missing key' }, { status: 400 })
    }

    const key = String(body.key)
    const value = body.value === undefined ? null : body.value

    const row = { key, value: value }
    const { error } = await supabaseAdmin.from('site_settings').upsert(row, { onConflict: 'key' as any })
    if (error) {
      console.error('site-settings POST error', error)
      return NextResponse.json({ error: 'db error' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, data: row })
  } catch (err) {
    console.error('site-settings POST exception', err)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}
