import { NextResponse } from 'next/server'

// Strict whoami: read `sb-access-token` cookie and validate it with Supabase
export async function GET(req: Request) {
	try {
		const cookieHeader = req.headers.get('cookie') || ''
		// Accept multiple possible cookie names and also Authorization header.
		const cookieCandidates = [
			/(?:^|; )sb-access-token=([^;]+)/, // legacy expected name
			/(?:^|; )sb:-?access-token=([^;]+)/, // some variants
			/(?:^|; )sb_token=([^;]+)/,
			/(?:^|; )supabase-auth-token=([^;]+)/,
			/(?:^|; )sb=([^;]+)/,
		]
		let token: string | null = null
		for (const re of cookieCandidates) {
			const m = cookieHeader.match(re)
			if (m && m[1]) { token = decodeURIComponent(m[1]); break }
		}
		// Fallback to Authorization header if present
		if (!token) {
			const auth = req.headers.get('authorization') || req.headers.get('Authorization') || ''
			if (auth && auth.toLowerCase().startsWith('bearer ')) token = auth.slice(7).trim()
		}
		if (!token) return new Response(JSON.stringify({ ok: false, error: 'unauthenticated' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
		const supabaseUrl = process.env.SUPABASE_URL || ''
		if (!supabaseUrl) return new Response(JSON.stringify({ ok: false, error: 'server misconfigured' }), { status: 500, headers: { 'Content-Type': 'application/json' } })

		// Query Supabase user endpoint using the resolved token
		const res = await fetch(`${supabaseUrl.replace(/\/$/, '')}/auth/v1/user`, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } })
		if (!res.ok) return new Response(JSON.stringify({ ok: false, error: 'unauthenticated' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
		const json = await res.json().catch(() => null)
		return new Response(JSON.stringify({ ok: true, user: json }), { status: 200, headers: { 'Content-Type': 'application/json' } })
	} catch (e: any) {
		return new Response(JSON.stringify({ ok: false, error: String(e?.message || e) }), { status: 500, headers: { 'Content-Type': 'application/json' } })
	}
}

export const runtime = 'nodejs'
