import { forwardToPublicWorker } from '@/lib/api-proxy'

export async function GET(req: Request) { return forwardToPublicWorker(req) }

// In local development, avoid proxying session sync to public-worker.
// Instead, set cookies directly so login succeeds even if the remote
// worker or Supabase environment is misconfigured. In production we
// continue to proxy to public-worker as before.
export async function POST(req: Request) {
	const nodeEnv = process.env.NODE_ENV || 'development'
	if (nodeEnv === 'production') {
		return forwardToPublicWorker(req)
	}

	try {
		const payload = await req.json().catch(() => ({} as any)) as any
		const access = payload?.access_token || ''
		const refresh = payload?.refresh_token || ''

		if (!access) {
			return new Response(JSON.stringify({ ok: false, error: 'missing_access_token' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json; charset=utf-8' },
			})
		}

		const headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8' })
		const origin = (req.headers.get('origin') || req.headers.get('Origin') || '') as string
		const isLocalOrigin = origin.includes('localhost') || origin.includes('127.0.0.1')
		// 開発環境では http://localhost で Cookie を受け取れるように
		// Secure を外し、SameSite=Lax にする。ドメイン指定も不要。
		const cookieOpts = isLocalOrigin
			? 'Path=/; HttpOnly; SameSite=Lax'
			: 'Path=/; HttpOnly; Secure; SameSite=None; Domain=.shirasame.com'

		headers.append('Set-Cookie', `sb-access-token=${encodeURIComponent(access)};${cookieOpts}`)
		if (refresh) headers.append('Set-Cookie', `sb-refresh-token=${encodeURIComponent(refresh)};${cookieOpts}`)

		return new Response(JSON.stringify({ ok: true, devBypass: true }), {
			status: 200,
			headers,
		})
	} catch (e: any) {
		return new Response(JSON.stringify({ ok: false, error: String(e?.message || e) }), {
			status: 500,
			headers: { 'Content-Type': 'application/json; charset=utf-8' },
		})
	}
}

export async function PUT(req: Request) { return forwardToPublicWorker(req) }
export async function DELETE(req: Request) { return forwardToPublicWorker(req) }
export async function PATCH(req: Request) { return forwardToPublicWorker(req) }
export async function OPTIONS(req: Request) { return forwardToPublicWorker(req) }

export const runtime = 'nodejs'
