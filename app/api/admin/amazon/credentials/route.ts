import { NextResponse } from 'next/server'
import getAdminSupabase from '@/lib/supabase/server'
import { getOwnerUserId } from '@/lib/owner'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('[admin/amazon/credentials] request body:', body)

    const { id = 'default', accessKey, secretKey, associateId } = body

    // Accept partial updates: only persist provided non-empty fields.
    // If all fields are empty/absent, treat as no-op and return 400.
    const hasAny = [accessKey, secretKey, associateId].some((v) => typeof v !== 'undefined' && String(v).trim().length > 0)
    if (!hasAny) {
      return NextResponse.json({ error: 'No credentials provided' }, { status: 400 })
    }

    const supabase = getAdminSupabase()
    // Resolve owner user id and associate credentials to that user
    let ownerUserId: string | null = null
    try {
      ownerUserId = await getOwnerUserId()
    } catch (oe) {
      console.error('[admin/amazon/credentials] failed to resolve owner', oe)
    }
    
    // Build payload only including provided, non-empty values.
    // If the client sends an empty string we treat it as "do not change" (do not write null)
    const payload: any = { id, updated_at: new Date().toISOString() }
    if (ownerUserId) payload.user_id = ownerUserId
    const nonEmpty = (v: any) => typeof v !== 'undefined' && String(v).trim().length > 0
    if (nonEmpty(accessKey)) payload.access_key = accessKey
    if (nonEmpty(secretKey)) payload.secret_key = secretKey
    if (nonEmpty(associateId)) payload.associate_id = associateId

    // If there's no existing row for this id and the client only provided a subset
    // of fields, an INSERT will be attempted which will fail if the table has
    // NOT NULL constraints. Check for existing row first to provide a clearer
    // error rather than a 500 constraint violation.
    try {
      // Prefer to select by user_id when available, otherwise fall back to id
      const selector = ownerUserId ? supabase.from('amazon_credentials').select('id,user_id').eq('user_id', ownerUserId).maybeSingle() : supabase.from('amazon_credentials').select('id').eq('id', id).single()
      const sel = await selector
      const existing = sel?.data ?? null
      const selectErr = sel?.error ?? null
      console.log('[admin/amazon/credentials] select check result:', { existing, selectErr })
      if (selectErr && String(selectErr.message || '').includes('Could not find the table')) {
        const guidance = `Database table public.amazon_credentials not found. Run the SQL migration to create the table (see sql/create_amazon_credentials.sql).`
        return NextResponse.json({ error: guidance }, { status: 500 })
      }
      const rowExists = !!existing
      console.log('[admin/amazon/credentials] rowExists:', rowExists)
      // If row does not exist, ensure we have all three fields (because INSERT requires NOT NULL cols)
      if (!rowExists) {
        const required = ['access_key', 'secret_key', 'associate_id']
        const provided = Object.keys(payload)
        const missing = required.filter((r) => !provided.includes(r))
        if (missing.length > 0) {
          console.log('[admin/amazon/credentials] missing fields for create:', missing)
          return NextResponse.json({ error: `No existing credentials row. To create one, provide values for: ${missing.join(', ')} or make those columns nullable in the DB.` }, { status: 400 })
        }
      }
    } catch (e) {
      // fall through to normal upsert and error handling below
      console.error('[admin/amazon/credentials] select check error', e)
    }

    // Log the actual payload that will be upserted for debugging
    console.log('[admin/amazon/credentials] upsert payload:', payload)

    // Upsert by user_id when available; ensure DB has unique index on user_id
    const onConflict = ownerUserId ? 'user_id' : 'id'
    const { data, error } = await supabase.from('amazon_credentials').upsert(payload, { onConflict })
    console.log('[admin/amazon/credentials] supabase upsert result:', { data, error })

    // Some Supabase/PostgREST setups may return `data: null` for upsert responses.
    // If upsert reported no error but returned no data, fetch the row explicitly
    // so the client can be shown the saved values.
    let finalData = data
    if (!finalData && !error) {
      try {
        const selector = ownerUserId ? supabase.from('amazon_credentials').select('*').eq('user_id', ownerUserId).maybeSingle() : supabase.from('amazon_credentials').select('*').eq('id', id).maybeSingle()
        const sel = await selector
        console.log('[admin/amazon/credentials] post-upsert select result:', sel)
        finalData = sel?.data ?? null
      } catch (e) {
        console.error('[admin/amazon/credentials] post-upsert select error', e)
      }
    }

    if (error) {
      console.error('[admin/amazon/credentials] upsert error', error)
      // Detect missing table in PostgREST/schema cache (PGRST205) and provide actionable message
      const msg = String(error.message || '')
      if (msg.includes('PGRST205') || /Could not find the table/i.test(msg)) {
        const guidance = `Database table public.amazon_credentials not found. Run the SQL migration to create the table (see sql/create_amazon_credentials.sql).`
        return NextResponse.json({ error: guidance }, { status: 500 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, data: finalData })
  } catch (err: any) {
    console.error('[admin/amazon/credentials] error', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
