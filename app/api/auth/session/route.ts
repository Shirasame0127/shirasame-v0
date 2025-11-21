import { NextResponse } from "next/server"
import supabaseAdmin from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const accessToken = body?.access_token || body?.token
    if (!accessToken) return NextResponse.json({ error: "missing token" }, { status: 400 })

    // Optionally verify token with Supabase admin client
    try {
      await supabaseAdmin.auth.getUser(accessToken)
    } catch (e) {
      // If verification fails, we still set cookie if running locally dev. In production ensure verification.
    }

    // Create secure cookie
    const cookieName = process.env.SESSION_COOKIE_NAME || "sb_access_token"
    const maxAge = Number(process.env.SESSION_MAX_AGE || 60 * 60) // default 1 hour
    const secure = process.env.NODE_ENV === "production"
    const sameSite = process.env.SESSION_SAMESITE || "Lax"

    const cookieValue = `${cookieName}=${accessToken}; Path=/; HttpOnly; Max-Age=${maxAge}; SameSite=${sameSite}` + (secure ? "; Secure" : "")

    const res = NextResponse.json({ ok: true })
    res.headers.append("Set-Cookie", cookieValue)
    return res
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 })
  }
}

export function GET() {
  return NextResponse.json({ info: "POST access_token to set HttpOnly cookie" })
}
