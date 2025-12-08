import { NextResponse } from 'next/server'

// Strict whoami: read `sb-access-token` cookie and validate it with Supabase
export async function GET(req: Request) {
	try {
		const cookieHeader = req.headers.get('cookie') || ''
		const m = cookieHeader.match(/(?:^|; )sb-access-token=([^;]+)/)
		if (!m || !m[1]) return new Response(JSON.stringify({ ok: false, error: 'unauthenticated' }), { status: 401, headers: { 'Content-Type': 'application/json' } })

		const token = decodeURIComponent(m[1])
		const supabaseUrl = process.env.SUPABASE_URL || ''
		if (!supabaseUrl) return new Response(JSON.stringify({ ok: false, error: 'server misconfigured' }), { status: 500, headers: { 'Content-Type': 'application/json' } })

		const res = await fetch(`${supabaseUrl.replace(/\/$/, '')}/auth/v1/user`, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } })
		if (!res.ok) return new Response(JSON.stringify({ ok: false, error: 'unauthenticated' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
		const json = await res.json().catch(() => null)
		return new Response(JSON.stringify({ ok: true, user: json }), { status: 200, headers: { 'Content-Type': 'application/json' } })
	} catch (e: any) {
		return new Response(JSON.stringify({ ok: false, error: String(e?.message || e) }), { status: 500, headers: { 'Content-Type': 'application/json' } })
	}
}

export const runtime = 'nodejs'
