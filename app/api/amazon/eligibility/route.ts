import { NextResponse } from "next/server"
import getAdminSupabase from "@/lib/supabase/server"

// POST /api/amazon/eligibility
// Body: { asin: string }
// This endpoint looks up stored Amazon credentials (from users table) and
// would call Amazon Product Advertising API (PA-API) to determine whether
// the given ASIN is eligible for a sale/discount or otherwise matches
// criteria during Amazon セール periods.
//
// NOTE: Full PA-API integration requires registering for PA-API keys and
// using their signed request flow. This route implements the lookup of
// credentials and returns a placeholder response if credentials are missing
// or if PA-API integration is not implemented yet.

export async function POST(req: Request) {
  const supabase = getAdminSupabase()
  try {
    const body = await req.json().catch(() => ({}))
    const asin = body?.asin
    if (!asin) return NextResponse.json({ error: 'asin is required' }, { status: 400 })

    // Fetch stored Amazon creds (we keep one user record)
    const { data: user, error } = await supabase.from('users').select('amazon_access_key,amazon_secret_key,amazon_associate_id').limit(1).maybeSingle()
    if (error) {
      console.warn('[api/amazon/eligibility] supabase error', error)
      return NextResponse.json({ error: String(error) }, { status: 500 })
    }

    const accessKey = user?.amazon_access_key
    const secretKey = user?.amazon_secret_key
    const associateId = user?.amazon_associate_id

    if (!accessKey || !secretKey || !associateId) {
      return NextResponse.json({
        asin,
        eligible: false,
        reason: 'amazon credentials not configured on server',
      }, { status: 200 })
    }

    // TODO: Integrate with Amazon PA-API here.
    // Example steps:
    // 1. Install an HTTP client and implement PA-API signed requests.
    // 2. Use the credentials (accessKey, secretKey, associateId) to call
    //    the PA-API endpoint for the ASIN and inspect offers/discounts.
    // 3. Map the PA-API response to an { eligible: boolean, details: {...} } shape.

    // Placeholder until PA-API integration is implemented
    return NextResponse.json({
      asin,
      eligible: false,
      reason: 'not implemented - PA-API integration required',
    }, { status: 200 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export const runtime = 'nodejs'
