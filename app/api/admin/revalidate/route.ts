// 管理者向け即時再生成エンドポイント (Option B1: ISR + タグ再検証)
// 署名付きトークン/認証ミドルウェア等で保護することを推奨。現状は簡易スタブ。
import { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";

function unauthorized(msg: string) {
  return new Response(JSON.stringify({ ok: false, error: msg }), { status: 401, headers: { 'content-type': 'application/json' } })
}

export async function POST(req: NextRequest) {
  try {
    const tokenHeader = req.headers.get('x-admin-token') || ''
    const expected = process.env.ADMIN_REVALIDATE_TOKEN || ''
    if (!expected) {
      return unauthorized('revalidate token not configured')
    }
    if (tokenHeader !== expected) {
      return unauthorized('invalid token')
    }
    const body = await req.json().catch(() => ({}))
    const tags: string[] = Array.isArray(body.tags) ? body.tags : []
    if (tags.length === 0) {
      return new Response(JSON.stringify({ ok: false, error: 'tags required' }), { status: 400, headers: { 'content-type': 'application/json' } })
    }
    for (const t of tags) {
      try {
        revalidateTag(t)
        if (process.env.ENABLE_ISR_LOGS === '1') {
          console.info('[ISR] manual revalidateTag', { tag: t, ts: new Date().toISOString() })
        }
      } catch {}
    }
    return new Response(JSON.stringify({ ok: true, revalidated: tags }), { status: 200, headers: { 'content-type': 'application/json' } })
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: e?.message || 'internal error' }), { status: 500, headers: { 'content-type': 'application/json' } })
  }
}
