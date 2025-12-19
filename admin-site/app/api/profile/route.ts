import { getUserFromCookieHeader } from '@/lib/server-auth'
import getSupabaseAdmin from '@/lib/supabase'

export const runtime = 'nodejs'

export async function GET(req: Request) {
	try {
		const cookieHeader = req.headers.get('cookie') || null
		const user = await getUserFromCookieHeader(cookieHeader)
		if (!user) return new Response(JSON.stringify({ data: null }), { status: 401, headers: { 'Content-Type': 'application/json; charset=utf-8' } })

		const supabase = getSupabaseAdmin()
		if (!supabase) return new Response(JSON.stringify({ data: null }), { status: 500, headers: { 'Content-Type': 'application/json; charset=utf-8' } })

		const { data, error } = await supabase.from('users').select('*').eq('id', user.id).limit(1)
		if (error) return new Response(JSON.stringify({ data: null }), { status: 500, headers: { 'Content-Type': 'application/json; charset=utf-8' } })
		const u = Array.isArray(data) && data.length > 0 ? data[0] : null
		if (!u) return new Response(JSON.stringify({ data: null }), { status: 404, headers: { 'Content-Type': 'application/json; charset=utf-8' } })

		const transformed = {
			id: u.id,
			name: u.name || null,
			displayName: u.display_name || u.displayName || u.name || null,
			email: u.email || null,
			avatarUrl: u.avatar_url || (u.profile_image_key ? `${process.env.NEXT_PUBLIC_IMAGES_DOMAIN || process.env.IMAGES_DOMAIN || ''}/${u.profile_image_key}` : null)
		}

		return new Response(JSON.stringify({ data: transformed }), { status: 200, headers: { 'Content-Type': 'application/json; charset=utf-8' } })
	} catch (e: any) {
		return new Response(JSON.stringify({ data: null }), { status: 500, headers: { 'Content-Type': 'application/json; charset=utf-8' } })
	}
}

export async function POST(req: Request) { return GET(req) }
export async function PUT(req: Request) { return GET(req) }
export async function DELETE(req: Request) { return GET(req) }
export async function PATCH(req: Request) { return GET(req) }
export async function OPTIONS(req: Request) { return GET(req) }
