import { NextResponse } from 'next/server'

// Create a Cloudflare Images direct upload URL
export async function POST(req: Request) {
	try {
		const account = process.env.CLOUDFLARE_ACCOUNT_ID
		const token = process.env.CLOUDFLARE_IMAGES_API_TOKEN
		if (!account || !token) {
			return new Response(JSON.stringify({ ok: false, error: 'Cloudflare Images credentials not configured' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
		}

		const cfRes = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/images/v2/direct_upload`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({}),
		})

		const json = await cfRes.json().catch(() => ({ ok: false }))
		return new Response(JSON.stringify(json), { status: cfRes.status, headers: { 'Content-Type': 'application/json' } })
	} catch (e: any) {
		return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500, headers: { 'Content-Type': 'application/json' } })
	}
}

export async function GET(req: Request) {
	return new Response(JSON.stringify({ ok: false, error: 'GET not supported on direct-upload' }), { status: 405, headers: { 'Content-Type': 'application/json' } })
}

export const runtime = 'nodejs'
