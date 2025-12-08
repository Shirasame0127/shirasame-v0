// Proxy upload to Cloudflare Images (server-side proxy fallback)
export async function POST(req: Request) {
	try {
		const account = process.env.CLOUDFLARE_ACCOUNT_ID
		const token = process.env.CLOUDFLARE_IMAGES_API_TOKEN
		if (!account || !token) {
			return new Response(JSON.stringify({ ok: false, error: 'Cloudflare Images credentials not configured' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
		}

		// Expect multipart/form-data with field 'file'
		const form = await req.formData()
		const file = form.get('file') as any
		if (!file) {
			return new Response(JSON.stringify({ ok: false, error: 'file field missing' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
		}

		// Forward to Cloudflare Images upload endpoint
		const cfForm = new FormData()
		cfForm.append('file', file)

		const cfRes = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/images/v1`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
			} as any,
			body: cfForm as any,
		})

		const json = await cfRes.json().catch(() => ({ ok: false }))
		return new Response(JSON.stringify(json), { status: cfRes.status, headers: { 'Content-Type': 'application/json' } })
	} catch (e: any) {
		return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500, headers: { 'Content-Type': 'application/json' } })
	}
}

export async function GET(req: Request) {
	return new Response(JSON.stringify({ ok: false, error: 'GET not supported on upload' }), { status: 405, headers: { 'Content-Type': 'application/json' } })
}

export const runtime = 'nodejs'
