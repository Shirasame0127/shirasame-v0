import { Hono } from 'hono'
// custom CORS handling (dynamic origin + credentials)
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { makeWeakEtag } from './utils/etag'
import { getSupabase } from './supabase'
import { getPublicImageUrl, buildResizedImageUrl, responsiveImageForUsage } from '../../shared/lib/image-usecases'

export type Env = {
  PUBLIC_ALLOWED_ORIGINS?: string
  // INTERNAL_API_BASE removed: public-worker is now the single API gateway
  INTERNAL_API_KEY?: string
  // Supabase
  SUPABASE_URL?: string
  SUPABASE_ANON_KEY?: string
  SUPABASE_SERVICE_ROLE_KEY?: string
  // R2 / Images
  R2_BUCKET?: string
  R2_PUBLIC_URL?: string
  IMAGES_DOMAIN?: string
  // R2 binding
  IMAGES?: any
  // Cloudflare Images
  CLOUDFLARE_ACCOUNT_ID?: string
  CLOUDFLARE_IMAGES_API_TOKEN?: string
  // Public profile / single-owner fallbacks
  PUBLIC_OWNER_USER_ID?: string
  PUBLIC_PROFILE_EMAIL?: string
  // Worker host override
  WORKER_PUBLIC_HOST?: string
  // Debug
  DEBUG_WORKER?: string
}

const app = new Hono<{ Bindings: Env }>()

// Admin authentication middleware: enforce JWT <-> X-User-Id matching
app.use('/api/admin/*', async (c, next) => {
  try {
    const env = c.env as any
    const debug = env.DEBUG_WORKER === 'true'
    // Extract header user id
    const headerUser = (c.req.header('x-user-id') || c.req.header('X-User-Id') || '').toString()
    // Extract token from Authorization or cookie
    const token = await getTokenFromRequest(c)
    if (debug) {
      try { console.log('admin-auth middleware: headerUser=', headerUser, 'tokenPresent=', !!token) } catch {}
    }
    // If headerUser is present, require token and ensure match.
    const verified = token ? await verifyTokenWithSupabase(token, c) : null
    if (headerUser) {
      if (!token) {
        const base = { 'Content-Type': 'application/json; charset=utf-8' }
        const merged = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), base)
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: merged })
      }
      if (!verified) {
        if (debug) try { console.log('admin-auth middleware: token verification failed') } catch {}
        const base = { 'Content-Type': 'application/json; charset=utf-8' }
        const merged = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), base)
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: merged })
      }
      if (verified !== headerUser) {
        if (debug) try { console.log('admin-auth middleware: token user mismatch header=', headerUser, 'tokenUser=', verified) } catch {}
        const base = { 'Content-Type': 'application/json; charset=utf-8' }
        const merged = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), base)
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: merged })
      }
      // matched
      try { c.set && c.set('userId', verified) } catch {}
      return await next()
    }

    // No headerUser: allow cookie/token-only flows if token verifies
    if (verified) {
      try { c.set && c.set('userId', verified) } catch {}
      return await next()
    }

    // No headerUser and no valid token -> unauthorized
    const base = { 'Content-Type': 'application/json; charset=utf-8' }
    const merged = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), base)
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: merged })
  } catch (e) {
    const base = { 'Content-Type': 'application/json; charset=utf-8' }
    const merged = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), base)
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: merged })
  }
})

// Debug and global error middleware: キャッチされなかった例外を詳細に返す（DEBUG_WORKER=true の場合は stack を含める）
// Centralized CORS header computation used across handlers and cache
function computeCorsHeaders(origin: string | null, env: any) {
  const allowed = ((env as any).PUBLIC_ALLOWED_ORIGINS || '').split(',').map((s: string) => s.trim()).filter(Boolean)
  let acOrigin = '*'
  if (origin) {
    if (allowed.length === 0 || allowed.indexOf('*') !== -1 || allowed.indexOf(origin) !== -1) {
      acOrigin = origin
    } else if (allowed.length > 0) {
      acOrigin = allowed[0]
    }
  } else if (allowed.length > 0) {
    acOrigin = allowed[0]
  }
  return {
    'Access-Control-Allow-Origin': acOrigin,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': 'Content-Type, If-None-Match, Authorization, X-Internal-Key, X-User-Id',
    'Access-Control-Allow-Methods': 'GET,HEAD,OPTIONS,POST,PUT,DELETE',
    'Access-Control-Expose-Headers': 'ETag',
    'Vary': 'Origin',
    'X-Served-By': 'public-worker',
  }
}

app.use('*', async (c, next) => {
  // Handle preflight immediately
  if (c.req.method === 'OPTIONS') {
    const headers = computeCorsHeaders(c.req.header('Origin') || null, c.env)
    // mark response as served by this worker for easy tracing
    headers['X-Served-By'] = 'public-worker'
    return new Response(null, { status: 204, headers })
  }

  try {
    const res = await next()
    // attach CORS headers to downstream response (overwrite to ensure presence)
    try {
      const ch = computeCorsHeaders(c.req.header('Origin') || null, c.env)
      for (const k of Object.keys(ch)) {
        try { res.headers.set(k, (ch as any)[k]) } catch {}
      }
        try { res.headers.set('X-Served-By', 'public-worker') } catch {}
    } catch {}
    return res
  } catch (e: any) {
    const body: any = { error: e?.message || String(e) }
    try {
      if ((c.env as any).DEBUG_WORKER === 'true') body.stack = e?.stack || null
    } catch {}
    const headers = computeCorsHeaders(c.req.header('Origin') || null, c.env)
      headers['X-Served-By'] = 'public-worker'
    headers['Content-Type'] = 'application/json; charset=utf-8'
    return new Response(JSON.stringify(body), { status: 500, headers })
  }
})

// NOTE: このワーカーは単体完結構成 (public-worker がすべての API を実装)
// です。以前の設計で使っていた INTERNAL_API_BASE による内部プロキシは撤去します。
// 以降、内部 API への転送チェックは行いません。

// Debug endpoint: 簡易的に環境やバインディングの存在を返す（本番では無効化してください）
app.get('/_debug', async (c) => {
  try {
    const bindings = {
      DEBUG_WORKER: (c.env as any).DEBUG_WORKER ?? null,
      SUPABASE_URL: !!(c.env as any).SUPABASE_URL,
      SUPABASE_ANON_KEY: !!(c.env as any).SUPABASE_ANON_KEY,
      R2_BUCKET: (c.env as any).R2_BUCKET ?? null,
      R2_PUBLIC_URL: (c.env as any).R2_PUBLIC_URL ?? null,
      hasIMAGESBinding: typeof (c.env as any).IMAGES !== 'undefined',
    }
    const headers = computeCorsHeaders(c.req.header('Origin') || null, c.env)
    headers['Content-Type'] = 'application/json; charset=utf-8'
    return new Response(JSON.stringify({ ok: true, bindings }), { headers })
  } catch (e: any) {
    const headers = computeCorsHeaders(c.req.header('Origin') || null, c.env)
    headers['Content-Type'] = 'application/json; charset=utf-8'
    return new Response(JSON.stringify({ ok: false, error: String(e?.message || e) }), { status: 500, headers })
  }
})

// Cache/ETag ヘルパ（GET専用）
async function cacheJson(c: any, key: string, getPayload: () => Promise<Response>) {
  const cache = (caches as any).default
  const req = new Request(new URL(key, 'http://dummy').toString())
  const ifNoneMatch = c.req.header('If-None-Match')
  // If the incoming request has an Origin header (i.e. a browser cross-origin
  // request), avoid returning potentially stale edge-cached responses that
  // might have been stored before CORS headers were added. For such requests
  // we fetch fresh payload, attach CORS headers, and do NOT return a cached
  // entry that could lack Access-Control-Allow-* headers. This prevents
  // browsers from being blocked by stale cached responses.
  const originHeader = c.req.header('Origin') || c.req.header('origin') || null
  if (originHeader) {
    const fresh = await getPayload()
    try {
      const buf = await fresh.clone().arrayBuffer()
      const etag = await makeWeakEtag(buf).catch(() => '')
      const cors = computeCorsHeaders(originHeader, c.env)
      const headers: Record<string, string> = Object.assign({
        'Content-Type': 'application/json; charset=utf-8',
        // For browser-originated requests prefer not to cache at CDN edge
        // to avoid serving stale responses without CORS. Use no-store here.
        'Cache-Control': 'no-store',
        'ETag': etag
      }, cors)
      return new Response(buf, { status: fresh.status, headers })
    } catch {
      return fresh
    }
  }

  const matched = await cache.match(req)
  if (matched) {
    const etag = matched.headers.get('ETag')
    const cors = computeCorsHeaders(c.req.header('Origin') || null, c.env)
    if (etag && ifNoneMatch && etag === ifNoneMatch) {
      const headers: Record<string, string> = Object.assign({}, cors, { 'ETag': etag })
      return new Response(null, { status: 304, headers })
    }
    try {
      const buf = await matched.arrayBuffer()
      const merged: Record<string, string> = {}
      matched.headers.forEach((v: string, k: string) => { merged[k] = v })
      Object.assign(merged, cors)
      return new Response(buf, { status: matched.status, headers: merged })
    } catch {
      return matched
    }
  }

  const res = await getPayload()
  // 200系のみキャッシュ対象
  if (res.ok) {
    const buf = await res.clone().arrayBuffer()
    const etag = await makeWeakEtag(buf)
    const cors = computeCorsHeaders(c.req.header('Origin') || null, c.env)
    const withHeaders = new Response(buf, {
      status: res.status,
      headers: Object.assign({
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
        'ETag': etag,
      }, cors)
    })
    await cache.put(req, withHeaders.clone())
    if (ifNoneMatch && etag === ifNoneMatch) {
      const merged304 = Object.assign({}, cors, { 'ETag': etag })
      return new Response(null, { status: 304, headers: merged304 })
    }
    return withHeaders
  }
  return res
}

// zod スキーマ（共通）
const listQuery = z.object({
  shallow: z.union([z.literal('true'), z.literal('false')]).optional(),
  published: z.union([z.literal('true'), z.literal('false')]).optional(),
  limit: z.string().regex(/^\d+$/).optional(),
  offset: z.string().regex(/^\d+$/).optional(),
  count: z.union([z.literal('true'), z.literal('false')]).optional(),
  tag: z.string().optional(),
  id: z.string().optional(),
  slug: z.string().optional(),
})

// INTERNAL_API_BASE による proxy ロジックは廃止しました。
// 以前は upstream() で内部 API を参照していましたが、現在は public-worker が
// すべての API を直接実装するため、この関数は不要です。
function upstream(_c: any, _path: string) { return null }

// Minimal header forwarder used when fallback-to-upstream behavior is exercised.
function makeUpstreamHeaders(c: any): Record<string, string> {
  const out: Record<string, string> = {}
  try {
    const auth = c.req.header('authorization') || c.req.header('Authorization')
    if (auth) out['authorization'] = auth
  } catch {}
  try {
    const cookie = c.req.header('cookie')
    if (cookie) out['cookie'] = cookie
  } catch {}
  try {
    const ct = c.req.header('content-type')
    if (ct) out['content-type'] = ct
  } catch {}
  return out
}

// Quick proxy to support incoming client calls that use the `/api/*` prefix
// (admin UI currently issues requests to `/api/...`). Many internal routes
// are defined without the `/api` prefix (e.g. `/products`, `/site-settings`),
// so forward `/api/*` -> `/*` to avoid client 404s. This performs a server-side
// fetch to the normalized path and returns the response. CORS headers are
// attached by the global middleware above.
// /api/* proxy moved to end of file so explicit routes are matched first.
// See end of file for the implemented proxy.

// NOTE: final catch-all moved to the end of the file so that explicitly
// registered routes (declared below) are matched before a 404 is returned.

// ヘルパ: JWT のペイロードをデコードして返す（署名検証は行いません。存在確認と sub/user_id 抽出用）
function parseJwtPayload(token: string | null | undefined): any | null {
  if (!token) return null
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null
    // base64url -> base64
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    // pad
    const pad = payload.length % 4
    const padded = payload + (pad === 2 ? '==' : pad === 3 ? '=' : pad === 0 ? '' : '')
    const decoded = atob(padded)
    return JSON.parse(decoded)
  } catch (e) {
    return null
  }
}

// トークン検証キャッシュ
const tokenUserCache = new Map<string, { id: string | null, ts: number }>()

// Supabase の auth エンドポイントを使ってトークンを検証しユーザーIDを取得する（キャッシュ付き）
async function verifyTokenWithSupabase(token: string, c: any): Promise<string | null> {
  try {
    if (!token) return null
    const now = Date.now()
    const cached = tokenUserCache.get(token)
    if (cached && (now - cached.ts) < 60_000) {
      try { if ((c.env as any).DEBUG_WORKER === 'true') console.log('verifyTokenWithSupabase: cache hit userId=', cached.id) } catch {}
      return cached.id
    }

    // Use the lightweight fetch-based helper to validate token and avoid
    // supabase-js client internals that may hang in some environments.
    try { if ((c.env as any).DEBUG_WORKER === 'true') console.log('verifyTokenWithSupabase: verifying token length=', token ? token.length : 0) } catch {}
    try {
      const user = await fetchUserFromToken(token, c)
      if (!user) {
        try { if ((c.env as any).DEBUG_WORKER === 'true') console.log('verifyTokenWithSupabase: fetchUserFromToken returned no user') } catch {}
        tokenUserCache.set(token, { id: null, ts: now })
        return null
      }
      const id = user?.id || user?.user?.id || user?.sub || user?.user_id || null
      try { if ((c.env as any).DEBUG_WORKER === 'true') console.log('verifyTokenWithSupabase: resolved userId=', id) } catch {}
      tokenUserCache.set(token, { id: id || null, ts: now })
      return id || null
    } catch (e) {
      try { if ((c.env as any).DEBUG_WORKER === 'true') console.log('verifyTokenWithSupabase: exception', String(e)) } catch {}
      tokenUserCache.set(token, { id: null, ts: now })
      return null
    }
  } catch (e) {
    return null
  }
}

// Extract token from request: prefer Authorization Bearer, then sb-access-token cookie
async function getTokenFromRequest(c: any): Promise<string | null> {
  try {
    const auth = (c.req.header('authorization') || c.req.header('Authorization') || '').toString()
    if (auth && auth.toLowerCase().startsWith('bearer ')) return auth.slice(7).trim()
    const cookieHeader = c.req.header('cookie') || ''
    const m = cookieHeader.match(/(?:^|; )sb-access-token=([^;]+)/)
    if (m && m[1]) return decodeURIComponent(m[1])
    return null
  } catch {
    return null
  }
}

// Fetch full user object from Supabase auth endpoint using a token
async function fetchUserFromToken(token: string | null, c: any): Promise<any | null> {
  try {
    if (!token) return null
    const supabaseUrl = (c.env.SUPABASE_URL || '').replace(/\/$/, '')
    if (!supabaseUrl) return null
    // TEMP LOG: do not log token contents; log masked metadata for debugging
    try { console.log('fetchUserFromToken: tokenPresent=', !!token, 'tokenLen=', token ? token.length : 0) } catch {}
    // Use AbortController to avoid hanging the worker if Supabase is slow/unreachable.
    const controller = new AbortController()
    const timeoutMs = 6000
    const id = setTimeout(() => controller.abort(), timeoutMs)
    try {
      const anonKey = (c.env.SUPABASE_ANON_KEY || '')
      const res = await fetch(`${supabaseUrl}/auth/v1/user`, { method: 'GET', headers: { Authorization: `Bearer ${token}`, apikey: anonKey, 'Content-Type': 'application/json' }, signal: controller.signal })
      try { console.log('fetchUserFromToken: supabase /user status=', res.status) } catch {}
      if (!res.ok) return null
      const user = await res.json().catch(() => null)
      try { console.log('fetchUserFromToken: got user id=', user?.id || user?.user?.id || user?.sub || user?.user_id || null) } catch {}
      return user || null
    } catch (e) {
      try { if ((c.env as any).DEBUG_WORKER === 'true') console.log('fetchUserFromToken: fetch error', String(e)) } catch {}
      return null
    } finally {
      clearTimeout(id)
    }
  } catch {
    return null
  }
}

// Convenience: get user object from incoming request (Authorization or cookie)
async function getUserFromRequest(c: any): Promise<any | null> {
  const token = await getTokenFromRequest(c)
  return await fetchUserFromToken(token, c)
}

// リクエストから userId を推定する（署名検証を優先）。非同期化したため呼び出し側で await が必要。
async function getRequestUserId(c: any): Promise<string | null> {
  try {
    const auth = c.req.header('authorization') || c.req.header('Authorization') || ''
    if (auth.toLowerCase().startsWith('bearer ')) {
      const token = auth.slice(7).trim()

      // ✅ 検証できた場合のみ返す
      const viaSupabase = await verifyTokenWithSupabase(token, c)
      return viaSupabase ?? null
    }

    const cookieHeader = c.req.header('cookie') || ''
    const m = cookieHeader.match(/(?:^|; )sb-access-token=([^;]+)/)
    if (m?.[1]) {
      const token = decodeURIComponent(m[1])
      const viaSupabase = await verifyTokenWithSupabase(token, c)
      return viaSupabase ?? null
    }

    return null
  } catch {
    return null
  }
}

// Centralized request user context resolver.
// Returns { userId, authType, trusted } where authType is one of:
//  - 'user-token'   : verified Supabase token (highest trust)
//  - 'internal-key' : request authenticated by INTERNAL_API_KEY (trusted)
//  - 'none'         : no trusted identity
async function resolveRequestUserContext(c: any, payload?: any): Promise<{ userId: string | null; authType: 'user-token' | 'internal-key' | 'none'; trusted: boolean }> {
  try {
    // TEMP LOG: inspect incoming headers to debug why some requests are unauthenticated
    try {
      const a = c.req.header('authorization') || c.req.header('Authorization') || ''
      if ((c.env as any).DEBUG_WORKER === 'true') console.log('resolveRequestUserContext: authorization present=', !!a)
    } catch (e) {}
    try { console.log('resolveRequestUserContext: cookie=', c.req.header('cookie')) } catch (e) {}
    try { console.log('resolveRequestUserContext: x-internal-key=', !!(c.req.header('x-internal-key') || c.req.header('X-Internal-Key'))) } catch (e) {}
    try { console.log('resolveRequestUserContext: x-user-id=', c.req.header('x-user-id') || c.req.header('X-User-Id')) } catch (e) {}
    // NEW BEHAVIOR: 管理ページから渡される `X-User-Id` ヘッダが存在する場合は
    // その user_id を権威あるユーザー識別子として扱います（/api/auth/* エンドポイントは除く）。
    // これは管理ページプロキシが信頼できる前提での運用向けの挙動です。
    try {
      const headerUser = (c.req.header('x-user-id') || c.req.header('X-User-Id') || '').toString()
      // Path を取り出す（c.req.path があれば利用、なければ URL を解析）
      const reqPath = (typeof c.req.path === 'string' && c.req.path) ? c.req.path : (new URL(c.req.url || '', 'http://localhost')).pathname
      if (headerUser && !reqPath.startsWith('/api/auth')) {
          // If an admin UI provided X-User-Id, require a valid token and ensure they match.
          try {
            const token = await getTokenFromRequest(c)
            if (!token) {
              try { if ((c.env as any).DEBUG_WORKER === 'true') console.log('resolveRequestUserContext: X-User-Id present but no token found -> unauthenticated') } catch {}
              return { userId: null, authType: 'none', trusted: false }
            }
            const viaSupabase = await verifyTokenWithSupabase(token, c)
            if (!viaSupabase) {
              try { if ((c.env as any).DEBUG_WORKER === 'true') console.log('resolveRequestUserContext: token verification failed for headerUser=', headerUser) } catch {}
              return { userId: null, authType: 'none', trusted: false }
            }
            if (viaSupabase !== headerUser) {
              try { if ((c.env as any).DEBUG_WORKER === 'true') console.log('resolveRequestUserContext: token user mismatch header=', headerUser, 'tokenUser=', viaSupabase) } catch {}
              return { userId: null, authType: 'none', trusted: false }
            }
            try { if ((c.env as any).DEBUG_WORKER === 'true') console.log('resolveRequestUserContext: header and token match, user=', headerUser) } catch {}
            return { userId: headerUser, authType: 'user-token', trusted: true }
          } catch (e) {
            return { userId: null, authType: 'none', trusted: false }
          }
      }
    } catch (e) {}
    // 1) Check bearer token or sb-access-token cookie first
    const auth = c.req.header('authorization') || c.req.header('Authorization') || ''
    if (auth.toLowerCase().startsWith('bearer ')) {
      const token = auth.slice(7).trim()
      const viaSupabase = await verifyTokenWithSupabase(token, c)
      if (viaSupabase) {
        // If client provided X-User-Id header, ensure it matches the token's user id
        try {
          const headerUser = (c.req.header('x-user-id') || c.req.header('X-User-Id') || '').toString()
          if (headerUser && headerUser !== viaSupabase) {
            try { console.log('resolveRequestUserContext: token user mismatch header=', headerUser, 'tokenUser=', viaSupabase) } catch {}
            return { userId: null, authType: 'none', trusted: false }
          }
        } catch (e) {}
        return { userId: viaSupabase, authType: 'user-token', trusted: true }
      }
    }

    const cookieHeader = c.req.header('cookie') || ''
    const m = cookieHeader.match(/(?:^|; )sb-access-token=([^;]+)/)
    if (m?.[1]) {
      const token = decodeURIComponent(m[1])
      const viaSupabase = await verifyTokenWithSupabase(token, c)
      if (viaSupabase) {
        try {
          const headerUser = (c.req.header('x-user-id') || c.req.header('X-User-Id') || '').toString()
          if (headerUser && headerUser !== viaSupabase) {
            try { console.log('resolveRequestUserContext: cookie token user mismatch header=', headerUser, 'tokenUser=', viaSupabase) } catch {}
            return { userId: null, authType: 'none', trusted: false }
          }
        } catch (e) {}
        return { userId: viaSupabase, authType: 'user-token', trusted: true }
      }
    }

    // 2) If internal key present, trust payload.userId or x-user-id header
    const provided = c.req.header('x-internal-key') || c.req.header('X-Internal-Key') || ''
    const expected = (c.env.INTERNAL_API_KEY || '').toString()
    const hasValidInternalKey = !!(expected && provided && provided === expected)
    if (hasValidInternalKey) {
      // prefer explicit payload.userId, then x-user-id header
      let uid: string | null = null
      if (payload && (payload.userId || payload.user_id)) uid = (payload.userId || payload.user_id)
      const headerUser = c.req.header('x-user-id') || c.req.header('X-User-Id') || ''
      if (!uid && headerUser) uid = headerUser
      return { userId: uid || null, authType: 'internal-key', trusted: true }
    }

    // 3) x-user-id alone is not trusted for write operations. Treat as none.
    const headerUser = c.req.header('x-user-id') || c.req.header('X-User-Id') || ''
    if (headerUser) {
      return { userId: headerUser || null, authType: 'none', trusted: false }
    }

    return { userId: null, authType: 'none', trusted: false }
  } catch (e) {
    return { userId: null, authType: 'none', trusted: false }
  }
}


// Direct implementations for collections/profile/recipes/tag-groups/tags
// All of these use Supabase anon client (RLS assumed) and share cache/ETag behavior.

// /collections
app.get('/collections', zValidator('query', listQuery.partial()), async (c) => {
  const supabase = getSupabase(c.env)
  const q = c.req.query()
  const limit = q.limit ? Math.max(0, parseInt(q.limit)) : null
  const offset = q.offset ? Math.max(0, parseInt(q.offset)) : 0
  const wantCount = q.count === 'true'
  const key = `collections${c.req.url.includes('?') ? c.req.url.substring(c.req.url.indexOf('?')) : ''}`
  return cacheJson(c, key, async () => {
    try {
      // 1) collections
      // If authenticated, return that user's collections (all visibility). Otherwise fall back to PUBLIC_OWNER_USER_ID or only public collections.
      let collections: any[] = []
      let total: number | null = null
      const ctx = await resolveRequestUserContext(c)
      // 管理ページ用途: 認証がない場合はアクセス拒否
      if (!ctx.trusted) {
        const base = { 'Content-Type': 'application/json; charset=utf-8' }
        const merged = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), base)
        return new Response(JSON.stringify({ error: 'unauthenticated' }), { status: 401, headers: merged })
      }
      const reqUserId = ctx.userId
      if (limit && limit > 0) {
        if (wantCount) {
          // Call select(...) first so Postgrest query builder methods like
          // .order()/.range() are available consistently across versions.
          let query: any = supabase.from('collections').select('*', { count: 'exact' }).order('created_at', { ascending: false })
          if (reqUserId) query = query.eq('user_id', reqUserId)
          else {
            const ownerId = (c.env.PUBLIC_OWNER_USER_ID || '').trim()
            if (ownerId) query = query.eq('user_id', ownerId)
            else query = query.eq('visibility', 'public')
          }
          const res = await query.range(offset, offset + Math.max(0, limit - 1))
          collections = res.data || []
          // @ts-ignore
          total = typeof res.count === 'number' ? res.count : null
        } else {
          let query: any = supabase.from('collections').select('*').order('created_at', { ascending: false })
          if (reqUserId) query = query.eq('user_id', reqUserId)
          else {
            const ownerId = (c.env.PUBLIC_OWNER_USER_ID || '').trim()
            if (ownerId) query = query.eq('user_id', ownerId)
            else query = query.eq('visibility', 'public')
          }
          const res = await query.range(offset, offset + Math.max(0, limit - 1))
          collections = res.data || []
        }
      } else {
        let query: any = supabase.from('collections').select('*').order('created_at', { ascending: false })
        if (reqUserId) query = query.eq('user_id', reqUserId)
        else {
          const ownerId = (c.env.PUBLIC_OWNER_USER_ID || '').trim()
          if (ownerId) query = query.eq('user_id', ownerId)
          else query = query.eq('visibility', 'public')
        }
        const res = await query
        collections = res.data || []
      }

      if (!collections || collections.length === 0) {
        const base = { 'Content-Type': 'application/json; charset=utf-8' }
        const merged = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), base)
        return new Response(JSON.stringify({ data: [], meta: total != null ? { total, limit, offset } : undefined }), { headers: merged })
      }

      const collectionIds = collections.map((c2: any) => c2.id)

      // 2) collection_items
      const { data: items = [] } = await supabase.from('collection_items').select('*').in('collection_id', collectionIds)
      const productIds = Array.from(new Set((items || []).map((it: any) => it.product_id)))

      // 3) products
      let products: any[] = []
      if (productIds.length > 0) {
        const shallowSelect = 'id,user_id,title,slug,short_description,tags,price,published,created_at,updated_at,images:product_images(id,product_id,key,width,height,role)'
        const baseSelect = '*, images:product_images(*), affiliateLinks:affiliate_links(*)'
        // 認証情報から userId を取得して優先的に絞り込む
        // Use outer scoped reqUserId (resolved above for collections)
        let prodQuery = supabase.from('products').select(shallowSelect).in('id', productIds).eq('published', true)
        if (reqUserId) {
          prodQuery = supabase.from('products').select(shallowSelect).in('id', productIds).eq('user_id', reqUserId)
        } else {
          const ownerId = (c.env.PUBLIC_OWNER_USER_ID || '').trim()
          if (ownerId) prodQuery = prodQuery.eq('user_id', ownerId)
        }
        const { data: prods = [] } = await prodQuery
        products = prods || []
      }

      const productMap = new Map<string, any>()
      for (const p of products) productMap.set(p.id, p)

      const transformed = collections.map((col: any) => {
        const thisItems = (items || []).filter((it: any) => it.collection_id === col.id)
        const thisProducts = thisItems.map((it: any) => productMap.get(it.product_id)).filter(Boolean)
        return {
          id: col.id,
          userId: col.user_id,
          title: col.title,
          description: col.description,
          visibility: col.visibility,
          createdAt: col.created_at,
          updatedAt: col.updated_at,
          products: thisProducts.map((p: any) => ({
            id: p.id,
            userId: p.user_id,
            title: p.title,
            slug: p.slug,
            shortDescription: p.short_description,
            body: p.body,
            tags: p.tags,
            price: p.price,
            published: p.published,
            createdAt: p.created_at,
            updatedAt: p.updated_at,
            showPrice: p.show_price,
            notes: p.notes,
            relatedLinks: p.related_links,
            images: Array.isArray(p.images) ? p.images.map((img: any) => ({ id: img.id, productId: img.product_id, url: getPublicImageUrl(img.key, c.env.IMAGES_DOMAIN) || img.url || null, key: img.key ?? null, width: img.width, height: img.height, aspect: img.aspect, role: img.role })) : [],
            affiliateLinks: Array.isArray(p.affiliateLinks) ? p.affiliateLinks.map((l: any) => ({ provider: l.provider, url: l.url, label: l.label })) : [],
          })),
        }
      })

      const meta = total != null ? { total, limit, offset } : undefined
      const base = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' }
      const merged = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), base)
      return new Response(JSON.stringify({ data: transformed, meta }), { headers: merged })
    } catch (e: any) {
      const base = { 'Content-Type': 'application/json; charset=utf-8' }
      const merged = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), base)
      return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500, headers: merged })
    }
  })
})

// /profile
app.get('/profile', zValidator('query', listQuery.partial()), async (c) => {
  const supabase = getSupabase(c.env)
  const key = `profile`
  return cacheJson(c, key, async () => {
    try {
      const ownerEmail = (c.env.PUBLIC_PROFILE_EMAIL || '').toString() || ''
      if (!ownerEmail) {
        const base = { 'Content-Type': 'application/json; charset=utf-8' }
        const merged = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), base)
        return new Response(JSON.stringify({ data: null }), { headers: merged })
      }
      const { data, error } = await supabase.from('users').select('*').eq('email', ownerEmail).limit(1)
      if (error) {
        const base = { 'Content-Type': 'application/json; charset=utf-8' }
        const merged = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), base)
        return new Response(JSON.stringify({ data: null }), { headers: merged })
      }
      const user = Array.isArray(data) && data.length > 0 ? data[0] : null
      if (!user) {
        const base = { 'Content-Type': 'application/json; charset=utf-8' }
        const merged = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), base)
        return new Response(JSON.stringify({ data: null }), { headers: merged })
      }
      const transformed = {
        id: user.id,
        name: user.name || null,
        displayName: user.display_name || user.displayName || user.name || null,
        email: user.email || null,
        avatarUrl: user.avatar_url || user.profile_image || null,
        profileImage: (user.profile_image_key ? getPublicImageUrl(user.profile_image_key, c.env.IMAGES_DOMAIN) : (user.profile_image || null)),
        profileImageKey: user.profile_image_key || null,
        headerImage: user.header_image || null,
        headerImages: (Array.isArray(user.header_image_keys) ? user.header_image_keys.map((k:any) => buildResizedImageUrl(k, { width: 800 }, c.env.IMAGES_DOMAIN)).filter(Boolean) : null),
        headerImageKey: user.header_image_key || null,
        headerImageKeys: user.header_image_keys || null,
        bio: user.bio || null,
        socialLinks: user.social_links || null,
      }
      const base = { 'Content-Type': 'application/json; charset=utf-8' }
      const merged = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), base)
      return new Response(JSON.stringify({ data: transformed }), { headers: merged })
    } catch (e: any) {
      const base = { 'Content-Type': 'application/json; charset=utf-8' }
      const merged = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), base)
      return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500, headers: merged })
    }
  })
})

// /recipes
app.get('/recipes', zValidator('query', listQuery.partial()), async (c) => {
  const supabase = getSupabase(c.env)
  const key = `recipes${c.req.url.includes('?') ? c.req.url.substring(c.req.url.indexOf('?')) : ''}`
  return cacheJson(c, key, async () => {
    try {
      // 管理用途: 認証必須（ログイン画面からの呼び出しを除く）
      const ctx = await resolveRequestUserContext(c)
      if (!ctx.trusted) {
        const base = { 'Content-Type': 'application/json; charset=utf-8' }
        const merged = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), base)
        return new Response(JSON.stringify({ error: 'unauthenticated' }), { status: 401, headers: merged })
      }
      let recipesQuery = supabase.from('recipes').select('*').order('created_at', { ascending: false }).eq('user_id', ctx.userId)
      const { data: recipes = [], error: recipesErr } = await recipesQuery
      if (recipesErr) {
        const base = { 'Content-Type': 'application/json; charset=utf-8' }
        const merged = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), base)
        return new Response(JSON.stringify({ error: recipesErr.message }), { status: 500, headers: merged })
      }
      const recipeIds = recipes.map((r: any) => r.id)
      const { data: pins = [] } = await supabase.from('recipe_pins').select('*').in('recipe_id', recipeIds)
      const pinsByRecipe = new Map<string, any[]>()
      for (const p of (pins || [])) {
        const mapped = {
          id: p.id,
          recipeId: p.recipe_id,
          productId: p.product_id,
          userId: p.user_id,
          tagDisplayText: p.tag_display_text ?? p.tag_text ?? null,
          dotXPercent: Number(p.dot_x_percent ?? p.dot_x ?? 0),
          dotYPercent: Number(p.dot_y_percent ?? p.dot_y ?? 0),
          tagXPercent: Number(p.tag_x_percent ?? p.tag_x ?? 0),
          tagYPercent: Number(p.tag_y_percent ?? p.tag_y ?? 0),
          dotSizePercent: Number(p.dot_size_percent ?? p.dot_size ?? 0),
          tagFontSizePercent: Number(p.tag_font_size_percent ?? p.tag_font_size ?? 0),
          lineWidthPercent: Number(p.line_width_percent ?? p.line_width ?? 0),
          tagPaddingXPercent: Number(p.tag_padding_x_percent ?? p.tag_padding_x ?? 0),
          tagPaddingYPercent: Number(p.tag_padding_y_percent ?? p.tag_padding_y ?? 0),
          tagBorderRadiusPercent: Number(p.tag_border_radius_percent ?? p.tag_border_radius ?? 0),
          tagBorderWidthPercent: Number(p.tag_border_width_percent ?? p.tag_border_width ?? 0),
          dotColor: p.dot_color ?? null,
          dotShape: p.dot_shape ?? null,
          tagText: p.tag_text ?? null,
          tagFontFamily: p.tag_font_family ?? null,
          tagFontWeight: p.tag_font_weight ?? null,
          tagTextColor: p.tag_text_color ?? null,
          tagTextShadow: p.tag_text_shadow ?? null,
          tagBackgroundColor: p.tag_background_color ?? null,
          tagBackgroundOpacity: Number(p.tag_background_opacity ?? 0),
          tagBorderColor: p.tag_border_color ?? null,
          tagShadow: p.tag_shadow ?? null,
          lineType: p.line_type ?? null,
          lineColor: p.line_color ?? null,
          createdAt: p.created_at || null,
          updatedAt: p.updated_at || null,
        }
        const arr = pinsByRecipe.get(mapped.recipeId) || []
        arr.push(mapped)
        pinsByRecipe.set(mapped.recipeId, arr)
      }

      const transformed = (recipes || []).map((r: any) => {
        const imgsRaw = Array.isArray(r.images) ? r.images : []
        const mappedImages = imgsRaw.map((img: any) => ({ id: img.id, recipeId: r.id, key: img.key ?? null, url: (img.key ? getPublicImageUrl(img.key, c.env.IMAGES_DOMAIN) : (img.url || null)), width: img.width, height: img.height }))
        if (r.base_image_id && mappedImages.length > 1) {
          const idx = mappedImages.findIndex((mi: any) => mi.id === r.base_image_id)
          if (idx > 0) {
            const [base] = mappedImages.splice(idx, 1)
            mappedImages.unshift(base)
          }
        }
        const mappedPins = pinsByRecipe.get(r.id) || []
        return {
          id: r.id,
          userId: r.user_id,
          title: r.title,
          published: !!r.published,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
          images: mappedImages,
          imageDataUrl: r.image_data_url || (mappedImages.length > 0 ? mappedImages[0].url : null) || null,
          pins: mappedPins,
        }
      })

      return new Response(JSON.stringify({ data: transformed }), { headers: { 'Content-Type': 'application/json; charset=utf-8' } })
    } catch (e: any) {
      return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500 })
    }
  })
})

// /tag-groups
app.get('/tag-groups', zValidator('query', listQuery.partial()), async (c) => {
  const supabase = getSupabase(c.env)
  const key = `tag-groups`
  return cacheJson(c, key, async () => {
    try {
      // TEMP LOG: show incoming cookie / headers for debugging auth forwarding
      try {
        console.log('=== public-worker: /tag-groups request ===')
        try { console.log('cookie:', c.req.header('cookie')) } catch {}
        try { console.log('x-user-id:', c.req.header('x-user-id') || c.req.header('X-User-Id')) } catch {}
        try { console.log('method:', c.req.method) } catch {}
        try { console.log('url:', c.req.url) } catch {}
        console.log('========================================')
      } catch(e) {}
      // If request is authenticated, return that user's tag groups. Otherwise fall back to configured PUBLIC_OWNER_USER_ID or global list.
        const ctx = await resolveRequestUserContext(c)
        // 管理用途のタグ群は認証必須
        if (!ctx.trusted) return new Response(JSON.stringify({ error: 'unauthenticated' }), { status: 401, headers: { 'Content-Type': 'application/json; charset=utf-8' } })
        const res = await supabase.from('tag_groups').select('name, label, sort_order, created_at').eq('user_id', ctx.userId).order('sort_order', { ascending: true, nullsFirst: false }).order('created_at', { ascending: true })
        if (res.error) return new Response(JSON.stringify({ data: [] }))
        return new Response(JSON.stringify({ data: res.data || [] }), { headers: { 'Content-Type': 'application/json; charset=utf-8' } })
    } catch (e: any) {
      return new Response(JSON.stringify({ data: [] }))
    }
  })
})

// /tags
app.get('/tags', zValidator('query', listQuery.partial()), async (c) => {
  const supabase = getSupabase(c.env)
  const key = `tags`
  return cacheJson(c, key, async () => {
    try {
      // If authenticated, return only that user's tags. Otherwise return global tags or PUBLIC_OWNER_USER_ID-scoped tags.
      const ctx = await resolveRequestUserContext(c)
      // 管理用途のタグは認証必須
      if (!ctx.trusted) return new Response(JSON.stringify({ error: 'unauthenticated' }), { status: 401, headers: { 'Content-Type': 'application/json; charset=utf-8' } })
      let query = supabase.from('tags').select('id, name, group, link_url, link_label, user_id, sort_order, created_at').order('sort_order', { ascending: true }).order('created_at', { ascending: true })
      query = query.eq('user_id', ctx.userId)
      const res = await query
      if (res.error) return new Response(JSON.stringify({ data: [] }))
      const mapped = (res.data || []).map((row: any) => ({ id: row.id, name: row.name, group: row.group ?? undefined, linkUrl: row.link_url ?? undefined, linkLabel: row.link_label ?? undefined, userId: row.user_id ?? undefined, sortOrder: row.sort_order ?? 0, createdAt: row.created_at }))
      return new Response(JSON.stringify({ data: mapped }), { headers: { 'Content-Type': 'application/json; charset=utf-8' } })
    } catch (e: any) {
      return new Response(JSON.stringify({ data: [] }))
    }
  })
})

// /amazon-sale-schedules
app.get('/amazon-sale-schedules', async (c) => {
  const supabase = getSupabase(c.env)
  const key = `amazon-sale-schedules`
  return cacheJson(c, key, async () => {
    try {
      // Scope schedules to authenticated user if present, otherwise PUBLIC_OWNER_USER_ID if configured
      const ctx = await resolveRequestUserContext(c)
      // 管理用途のスケジュールは認証必須
      if (!ctx.trusted) return new Response(JSON.stringify({ error: 'unauthenticated' }), { status: 401, headers: { 'Content-Type': 'application/json; charset=utf-8' } })
      let query = supabase.from('amazon_sale_schedules').select('*').order('start_date', { ascending: true }).eq('user_id', ctx.userId)
      const { data = [], error } = await query
      if (error) return new Response(JSON.stringify({ data: [] }), { headers: { 'Content-Type': 'application/json; charset=utf-8' } })
      const mapped = (data || []).map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        saleName: row.sale_name,
        startDate: row.start_date,
        endDate: row.end_date,
        collectionId: row.collection_id,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }))
      return new Response(JSON.stringify({ data: mapped }), { headers: { 'Content-Type': 'application/json; charset=utf-8' } })
    } catch (e: any) {
      return new Response(JSON.stringify({ data: [] }), { headers: { 'Content-Type': 'application/json; charset=utf-8' } })
    }
  })
})

// /site-settings
app.get('/site-settings', async (c) => {
  const upstreamUrl = upstream(c, '/api/site-settings')
  const key = `site-settings`
  return cacheJson(c, key, async () => {
    try {
      // If an INTERNAL_API_BASE is configured, proxy to it (admin API)
      if (upstreamUrl) {
        const res = await fetch(upstreamUrl, { method: 'GET', headers: makeUpstreamHeaders(c) })
        if (!res.ok) return new Response(JSON.stringify({ data: {} }), { headers: { 'Content-Type': 'application/json; charset=utf-8' } })
        const json = await res.json().catch(() => ({ data: {} }))
        return new Response(JSON.stringify(json), { headers: { 'Content-Type': 'application/json; charset=utf-8' } })
      }

      // Otherwise, try to read from Supabase (anon). Return key/value map like admin API.
      const supabase = getSupabase(c.env)
      const { data, error } = await supabase.from('site_settings').select('key, value').limit(100)
      if (error) return new Response(JSON.stringify({ data: {} }), { headers: { 'Content-Type': 'application/json; charset=utf-8' } })
      const rows = Array.isArray(data) ? data : []
      const out: Record<string, any> = {}
      for (const r of rows) {
        try {
          if (r && typeof r.key === 'string') out[r.key] = r.value
        } catch {}
      }
      return new Response(JSON.stringify({ data: out }), { headers: { 'Content-Type': 'application/json; charset=utf-8' } })
    } catch (e: any) {
      return new Response(JSON.stringify({ data: {} }), { headers: { 'Content-Type': 'application/json; charset=utf-8' } })
    }
  })
})

// Allow admin clients to update a single site setting via POST /site-settings
app.post('/site-settings', async (c) => {
  try {
    const internal = upstream(c, '/api/site-settings')
    const ctx = await resolveRequestUserContext(c)
    const hasValidInternalKey = ctx.authType === 'internal-key'
    // require authenticated admin user or internal key
    if (!ctx.trusted && !hasValidInternalKey) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json; charset=utf-8' } })

    // If there's an internal API configured, proxy the write upstream
    if (internal) {
      const headers = makeUpstreamHeaders(c)
      if (ctx.trusted && ctx.userId) headers['x-user-id'] = ctx.userId
      const bodyText = await c.req.text()
      const res = await fetch(internal, { method: 'POST', body: bodyText, headers })
      const buf = await res.arrayBuffer()
      return new Response(buf, { status: res.status, headers: { 'Content-Type': res.headers.get('content-type') || 'application/json; charset=utf-8' } })
    }

    // Otherwise perform upsert directly to Supabase site_settings using service role
    const supabaseUrl = (c.env.SUPABASE_URL || '').replace(/\/$/, '')
    const serviceKey = (c.env.SUPABASE_SERVICE_ROLE_KEY || '').toString()
    if (!supabaseUrl || !serviceKey) return new Response(JSON.stringify({ error: 'not_configured' }), { status: 500, headers: { 'Content-Type': 'application/json; charset=utf-8' } })

    const body = await c.req.json().catch(() => null)
    if (!body || typeof body.key !== 'string') return new Response(JSON.stringify({ error: 'bad_request' }), { status: 400, headers: { 'Content-Type': 'application/json; charset=utf-8' } })

    const valueRaw = body.value === undefined ? null : body.value
    const value = typeof valueRaw === 'string' ? valueRaw : JSON.stringify(valueRaw)

    const upUrl = `${supabaseUrl}/rest/v1/site_settings?on_conflict=key`
    const res = await fetch(upUrl, {
      method: 'POST',
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
      body: JSON.stringify({ key: body.key, value })
    })

    if (!res.ok) return new Response(JSON.stringify({ error: 'upsert_failed' }), { status: res.status, headers: { 'Content-Type': 'application/json; charset=utf-8' } })
    const j = await res.json().catch(() => null)
    const outVal = j && Array.isArray(j) && j.length > 0 ? j[0].value : null
    return new Response(JSON.stringify({ data: { [body.key]: outVal } }), { headers: { 'Content-Type': 'application/json; charset=utf-8' } })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500, headers: { 'Content-Type': 'application/json; charset=utf-8' } })
  }
})

// Admin settings endpoint (fallback when INTERNAL_API_BASE is not configured)
app.get('/api/admin/settings', async (c) => {
  try {
    const internal = upstream(c, '/api/admin/settings')
    const ctx = await resolveRequestUserContext(c)
    // TEMP LOG: inspect resolved context for admin settings access
    try {
      console.log('admin/settings: ctx.trusted=', !!ctx.trusted, 'ctx.userId=', ctx.userId)
      console.log('admin/settings: cookie=', c.req.header('cookie'))
      console.log('admin/settings: authorization present=', !!(c.req.header('authorization') || c.req.header('Authorization')))
    } catch (e) {}
    const hasValidInternalKey = ctx.authType === 'internal-key'
    // require authenticated user or internal key for admin settings
    if (!ctx.trusted && !hasValidInternalKey) {
      const base = { 'Content-Type': 'application/json; charset=utf-8' }
      const merged = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), base)
      return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: merged })
    }
    if (internal) {
      const headers = makeUpstreamHeaders(c)
      if (ctx.trusted && ctx.userId) headers['x-user-id'] = ctx.userId
      const res = await fetch(internal, { method: 'GET', headers })
      const json = await res.json().catch(() => ({ data: {} }))
      const base = { 'Content-Type': 'application/json; charset=utf-8' }
      const merged = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), base)
      return new Response(JSON.stringify(json), { status: res.status, headers: merged })
    }

    // Fallback: read from Supabase site_settings table and return as key/value map
    const supabaseUrl = (c.env.SUPABASE_URL || '').replace(/\/$/, '')
    const serviceKey = (c.env.SUPABASE_SERVICE_ROLE_KEY || '').toString()
    // If Supabase service role is not configured, return an empty settings
    // object instead of 502 so the admin UI doesn't break when an upstream
    // internal API is not present. A missing service role means the worker
    // cannot perform secure upserts; admin users should configure either
    // `INTERNAL_API_BASE` or `SUPABASE_SERVICE_ROLE_KEY` in production.
    if (!supabaseUrl || !serviceKey) {
      return new Response(JSON.stringify({ data: {} }), { status: 200, headers: { 'Content-Type': 'application/json; charset=utf-8' } })
    }

    const url = `${supabaseUrl}/rest/v1/site_settings?select=key,value`
    const resp = await fetch(url, { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } })
    if (!resp.ok) return new Response(JSON.stringify({ data: {} }), { headers: { 'Content-Type': 'application/json; charset=utf-8' } })
    const rows = await resp.json().catch(() => [])
    const out: Record<string, any> = {}
    // Keys that belong to user profile should not be populated from site_settings
    // to avoid site-level keys (e.g. 'email') overwriting per-user values.
    const reservedUserKeys = new Set([
      'id', 'user_id',
      'displayName', 'display_name', 'name', 'email',
      'profileImage', 'profile_image', 'profile_image_key', 'profileImageKey',
      'headerImage', 'header_image', 'header_image_key', 'headerImageKey', 'header_image_keys', 'headerImageKeys',
      'bio', 'socialLinks', 'social_links',
      'backgroundType', 'background_type', 'backgroundValue', 'background_value', 'backgroundImageKey', 'background_image_key',
    ])
    for (const r of Array.isArray(rows) ? rows : []) {
      try {
        if (!r || typeof r.key !== 'string') continue
        if (reservedUserKeys.has(r.key)) continue
        out[r.key] = r.value
      } catch {}
    }

    // If we have an authenticated user id, also fetch that user's row from `users` table
    try {
      let ctxUser = ctx.userId
      // Fallback: if resolveRequestUserContext did not resolve a userId but
      // a cookie-based token exists, try to verify it explicitly and use that id.
      if (!ctxUser) {
        try {
          const maybeToken = await getTokenFromRequest(c)
          if (maybeToken) {
            const via = await verifyTokenWithSupabase(maybeToken, c)
            if (via) ctxUser = via
          }
        } catch (e) {}
      }

      if (ctxUser) {
        const userUrl = `${supabaseUrl}/rest/v1/users?id=eq.${encodeURIComponent(ctxUser)}&select=*`
        const ures = await fetch(userUrl, { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } })
        if (ures.ok) {
          const urows = await ures.json().catch(() => [])
          if (Array.isArray(urows) && urows.length > 0) {
            const u = urows[0]
            // normalize user row to camelCase fields expected by admin UI
            try {
              const mapHeaderKeys = (v: any) => {
                if (!v) return []
                if (Array.isArray(v)) return v
                if (typeof v === 'string') {
                  try { return JSON.parse(v) } catch { return [String(v)] }
                }
                return []
              }

              const social = (u.social_links || u.socialLinks)
              let socialLinksParsed: any = []
              if (social) {
                if (Array.isArray(social)) socialLinksParsed = social
                else if (typeof social === 'string') {
                  try { socialLinksParsed = JSON.parse(social) } catch { socialLinksParsed = [] }
                }
              }

              const normalized: Record<string, any> = {
                id: u.id || u.user_id || null,
                displayName: u.display_name || u.displayName || u.name || null,
                bio: u.bio || null,
                email: u.email || null,
                profileImage: (u.profile_image_key ? getPublicImageUrl(u.profile_image_key, c.env.IMAGES_DOMAIN) : (u.profile_image || null)),
                profileImageKey: u.profile_image_key || u.profileImageKey || u.profile_image_key || null,
                headerImageKeys: mapHeaderKeys(u.header_image_keys || u.headerImageKeys || u.header_images || u.header_images_keys),
                headerImages: (function(keys:any[]){ try { return (Array.isArray(keys) ? keys : []).map(k=> buildResizedImageUrl(k, { width: 800 }, c.env.IMAGES_DOMAIN)).filter(Boolean) } catch { return [] } })(mapHeaderKeys(u.header_image_keys || u.headerImageKeys || u.header_images || u.header_images_keys)),
                headerImage: u.header_image || null,
                backgroundType: u.background_type || u.backgroundType || null,
                backgroundValue: u.background_value || u.backgroundValue || null,
                backgroundImageKey: u.background_image_key || u.backgroundImageKey || null,
                amazonAccessKey: u.amazon_access_key || u.amazonAccessKey || null,
                amazonSecretKey: u.amazon_secret_key || u.amazonSecretKey || null,
                amazonAssociateId: u.amazon_associate_id || u.amazonAssociateId || null,
                socialLinks: socialLinksParsed,
                profile_image_key: u.profile_image_key || null,
                header_image_keys: u.header_image_keys || null,
              }

              for (const [k, v] of Object.entries(normalized)) {
                try { out[k] = v } catch {}
              }
            } catch (e) {
              // ignore normalization errors
            }
          }
        }
      }
    } catch (e) {
      // ignore user fetch errors and continue returning site settings
    }

    const base = { 'Content-Type': 'application/json; charset=utf-8' }
    const merged = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), base)
    return new Response(JSON.stringify({ data: out }), { headers: merged })
  } catch (e: any) {
    return new Response(JSON.stringify({ data: {} }), { headers: { 'Content-Type': 'application/json; charset=utf-8' } })
  }
})

// Also accept `/admin/settings` (some proxies remove the `/api` prefix).
app.get('/admin/settings', async (c) => {
  try {
    const internal = upstream(c, '/api/admin/settings')
    const ctx = await resolveRequestUserContext(c)
    const hasValidInternalKey = ctx.authType === 'internal-key'
    // require authenticated user or internal key for admin settings
    if (!ctx.trusted && !hasValidInternalKey) {
      const base = { 'Content-Type': 'application/json; charset=utf-8' }
      const merged = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), base)
      return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: merged })
    }

    if (internal) {
      const headers = makeUpstreamHeaders(c)
      if (ctx.trusted && ctx.userId) headers['x-user-id'] = ctx.userId
      const res = await fetch(internal, { method: 'GET', headers })
      const json = await res.json().catch(() => ({ data: {} }))
      const base = { 'Content-Type': 'application/json; charset=utf-8' }
      const merged = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), base)
      return new Response(JSON.stringify(json), { status: res.status, headers: merged })
    }

    const supabaseUrl = (c.env.SUPABASE_URL || '').replace(/\/$/, '')
    const serviceKey = (c.env.SUPABASE_SERVICE_ROLE_KEY || '').toString()
    if (!supabaseUrl || !serviceKey) {
      return new Response(JSON.stringify({ data: {} }), { status: 200, headers: { 'Content-Type': 'application/json; charset=utf-8' } })
    }

    const url = `${supabaseUrl}/rest/v1/site_settings?select=key,value`
    const resp = await fetch(url, { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } })
    if (!resp.ok) return new Response(JSON.stringify({ data: {} }), { headers: { 'Content-Type': 'application/json; charset=utf-8' } })
    const rows = await resp.json().catch(() => [])
    const out: Record<string, any> = {}
    // Keys that belong to user profile should not be populated from site_settings
    const reservedUserKeys = new Set([
      'id', 'user_id',
      'displayName', 'display_name', 'name', 'email',
      'profileImage', 'profile_image', 'profile_image_key', 'profileImageKey',
      'headerImage', 'header_image', 'header_image_key', 'headerImageKey', 'header_image_keys', 'headerImageKeys',
      'bio', 'socialLinks', 'social_links',
      'backgroundType', 'background_type', 'backgroundValue', 'background_value', 'backgroundImageKey', 'background_image_key',
    ])
    for (const r of Array.isArray(rows) ? rows : []) {
      try {
        if (!r || typeof r.key !== 'string') continue
        if (reservedUserKeys.has(r.key)) continue
        out[r.key] = r.value
      } catch {}
    }

    // If we have an authenticated user id, also fetch that user's row from `users` table
    try {
      let ctxUser = ctx.userId
      if (!ctxUser) {
        try {
          const maybeToken = await getTokenFromRequest(c)
          if (maybeToken) {
            const via = await verifyTokenWithSupabase(maybeToken, c)
            if (via) ctxUser = via
          }
        } catch (e) {}
      }

      if (ctxUser) {
        const userUrl = `${supabaseUrl}/rest/v1/users?id=eq.${encodeURIComponent(ctxUser)}&select=*`
        const ures = await fetch(userUrl, { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } })
        if (ures.ok) {
          const urows = await ures.json().catch(() => [])
          if (Array.isArray(urows) && urows.length > 0) {
            const u = urows[0]
            const mapHeaderKeys = (v: any) => {
              if (!v) return []
              if (Array.isArray(v)) return v
              if (typeof v === 'string') {
                try { return JSON.parse(v) } catch { return [String(v)] }
              }
              return []
            }
            const social = (u.social_links || u.socialLinks)
            let socialLinksParsed: any = []
            if (social) {
              if (Array.isArray(social)) socialLinksParsed = social
              else if (typeof social === 'string') {
                try { socialLinksParsed = JSON.parse(social) } catch { socialLinksParsed = [] }
              }
            }
            const normalized: Record<string, any> = {
              id: u.id || u.user_id || null,
              displayName: u.display_name || u.displayName || u.name || null,
              bio: u.bio || null,
              email: u.email || null,
              profileImage: u.profile_image || null,
              profileImageKey: u.profile_image_key || u.profileImageKey || u.profile_image_key || null,
              headerImageKeys: mapHeaderKeys(u.header_image_keys || u.headerImageKeys || u.header_images || u.header_images_keys),
              headerImages: (function(keys:any[]){ try { return (Array.isArray(keys) ? keys : []).map(k=> buildResizedImageUrl(k, { width: 800 }, c.env.IMAGES_DOMAIN)).filter(Boolean) } catch { return [] } })(mapHeaderKeys(u.header_image_keys || u.headerImageKeys || u.header_images || u.header_images_keys)),
              headerImage: u.header_image || null,
              backgroundType: u.background_type || u.backgroundType || null,
              backgroundValue: u.background_value || u.backgroundValue || null,
              backgroundImageKey: u.background_image_key || u.backgroundImageKey || null,
              amazonAccessKey: u.amazon_access_key || u.amazonAccessKey || null,
              amazonSecretKey: u.amazon_secret_key || u.amazonSecretKey || null,
              amazonAssociateId: u.amazon_associate_id || u.amazonAssociateId || null,
              socialLinks: socialLinksParsed,
              profile_image_key: u.profile_image_key || null,
              header_image_keys: u.header_image_keys || null,
            }
            for (const [k, v] of Object.entries(normalized)) {
              try { out[k] = v } catch {}
            }
          }
        }
      }
    } catch (e) {
      // ignore user fetch errors and continue returning site settings
    }

    const base = { 'Content-Type': 'application/json; charset=utf-8' }
    const merged = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), base)
    return new Response(JSON.stringify({ data: out }), { headers: merged })
  } catch (e: any) {
    return new Response(JSON.stringify({ data: {} }), { headers: { 'Content-Type': 'application/json; charset=utf-8' } })
  }
})

app.put('/api/admin/settings', async (c) => {
  try {
    const internal = upstream(c, '/api/admin/settings')
    const bodyText = await c.req.text()
    const ctx = await resolveRequestUserContext(c)
    const hasValidInternalKey = ctx.authType === 'internal-key'
    if (!ctx.trusted && !hasValidInternalKey) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json; charset=utf-8' } })
    if (internal) {
      const headers = { ...makeUpstreamHeaders(c) }
      if (ctx.trusted && ctx.userId) headers['x-user-id'] = ctx.userId
      const res = await fetch(internal, { method: 'PUT', body: bodyText, headers })
      const buf = await res.arrayBuffer()
      return new Response(buf, { status: res.status, headers: { 'Content-Type': res.headers.get('content-type') || 'application/json; charset=utf-8' } })
    }

    const supabaseUrl = (c.env.SUPABASE_URL || '').replace(/\/$/, '')
    const serviceKey = (c.env.SUPABASE_SERVICE_ROLE_KEY || '').toString()
    // If Supabase service role is not configured, return a neutral success
    // response so the admin UI can continue without blowing up.
    if (!supabaseUrl || !serviceKey) return new Response(JSON.stringify({ data: {} }), { status: 200, headers: { 'Content-Type': 'application/json; charset=utf-8' } })

    const payload = JSON.parse(bodyText || '{}')
    // If payload contains user fields or an id, upsert users table using service role key
    const out: Record<string, any> = {}
    try {
      const maybeId = payload.id || payload.userId || null
      // Build user update object from common keys (support camelCase and snake_case)
      const userFields: Record<string, any> = {}
      const map: Record<string, string> = {
        displayName: 'display_name',
        display_name: 'display_name',
        bio: 'bio',
        email: 'email',
        profileImageKey: 'profile_image_key',
        profile_image_key: 'profile_image_key',
        profileImage: 'profile_image',
        profile_image: 'profile_image',
        headerImageKeys: 'header_image_keys',
        header_image_keys: 'header_image_keys',
        backgroundImageKey: 'background_image_key',
        background_image_key: 'background_image_key',
        backgroundValue: 'background_value',
        background_value: 'background_value',
      }
      for (const [k, v] of Object.entries(payload || {})) {
        if (k === 'id' || k === 'userId') continue
        const mapped = map[k as string]
        if (mapped) {
          userFields[mapped] = v
        }
      }

      // Normalize profile_image_key to a canonical key-only form (no leading slash or full URL)
      if (userFields.profile_image_key && typeof userFields.profile_image_key === 'string') {
        try {
          let v = userFields.profile_image_key as string
          // If a full URL was provided, extract pathname
          if (/^https?:\/\//i.test(v)) {
            try {
              const u = new URL(v)
              v = u.pathname.replace(/^\/+/, '')
            } catch (e) {
              // fallback: strip domain-like prefix
              v = v.replace(/^https?:\/\/[^^/]+\//i, '')
            }
          }
          // Remove leading slash if present
          v = v.replace(/^\/+/, '')
          userFields.profile_image_key = v
        } catch (e) {
          // ignore normalization errors
        }
      }

      if (maybeId && Object.keys(userFields).length > 0) {
        // upsert into users table
        const upUrl = `${supabaseUrl}/rest/v1/users?on_conflict=id`
        const bodyObj: any = { id: maybeId, ...userFields }
        const res = await fetch(upUrl, {
          method: 'POST',
          headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
          body: JSON.stringify(bodyObj),
        })
        if (res.ok) {
          const j = await res.json().catch(() => null)
          if (Array.isArray(j) && j.length > 0) {
            const u = j[0]
            // normalize returned user row into camelCase keys for response
            const mapHeaderKeys = (v: any) => {
              if (!v) return []
              if (Array.isArray(v)) return v
              if (typeof v === 'string') {
                try { return JSON.parse(v) } catch { return [String(v)] }
              }
              return []
            }
            const social = (u.social_links || u.socialLinks)
            let socialLinksParsed: any = []
            if (social) {
              if (Array.isArray(social)) socialLinksParsed = social
              else if (typeof social === 'string') {
                try { socialLinksParsed = JSON.parse(social) } catch { socialLinksParsed = [] }
              }
            }
            out.user = {
              id: u.id || u.user_id || null,
              displayName: u.display_name || u.displayName || u.name || null,
              bio: u.bio || null,
              email: u.email || null,
              profileImage: (u.profile_image_key ? getPublicImageUrl(u.profile_image_key, c.env.IMAGES_DOMAIN) : (u.profile_image || null)),
              profileImageKey: u.profile_image_key || null,
              headerImageKeys: mapHeaderKeys(u.header_image_keys || u.headerImageKeys || u.header_images),
              headerImages: (function(keys:any[]){ try { return (Array.isArray(keys) ? keys : []).map(k=> buildResizedImageUrl(k, { width: 800 }, c.env.IMAGES_DOMAIN)).filter(Boolean) } catch { return [] } })(mapHeaderKeys(u.header_image_keys || u.headerImageKeys || u.header_images)),
              backgroundType: u.background_type || null,
              backgroundValue: u.background_value || null,
              backgroundImageKey: u.background_image_key || null,
              amazonAccessKey: u.amazon_access_key || null,
              amazonSecretKey: u.amazon_secret_key || null,
              amazonAssociateId: u.amazon_associate_id || null,
              socialLinks: socialLinksParsed,
            }
          }
        }
      }
    } catch (e) {
      // continue to site_settings upsert
    }

    // Upsert each remaining key into site_settings via Supabase REST upsert
    for (const [k, v] of Object.entries(payload || {})) {
      try {
        // skip keys handled as user fields
        if (['id', 'userId', 'displayName', 'display_name', 'bio', 'email', 'profileImageKey', 'profile_image_key', 'profileImage', 'profile_image', 'headerImageKeys', 'header_image_keys', 'backgroundImageKey', 'background_image_key', 'backgroundValue', 'background_value'].includes(k)) continue
        const upUrl = `${supabaseUrl}/rest/v1/site_settings?on_conflict=key`
        const res = await fetch(upUrl, {
          method: 'POST',
          headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
          body: JSON.stringify({ key: k, value: typeof v === 'string' ? v : JSON.stringify(v) })
        })
        const j = await res.json().catch(() => null)
        if (j && Array.isArray(j) && j.length > 0) out[k] = j[0].value || null
      } catch (e) {
        // continue
      }
    }

    // If we updated a user row, include it in response data under top-level keys
    if (out.user && typeof out.user === 'object') {
      for (const kk of Object.keys(out.user)) {
        try { out[kk] = out.user[kk] } catch {}
      }
      delete out.user
    }

    return new Response(JSON.stringify({ data: out }), { headers: { 'Content-Type': 'application/json; charset=utf-8' } })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500, headers: { 'Content-Type': 'application/json; charset=utf-8' } })
  }
})

// Also accept `/admin/settings` (compatibility)
app.put('/admin/settings', async (c) => {
  try {
    const internal = upstream(c, '/api/admin/settings')
    const bodyText = await c.req.text()
    const ctx = await resolveRequestUserContext(c)
    const hasValidInternalKey = ctx.authType === 'internal-key'
    // require authenticated user or internal key for admin settings
    if (!ctx.trusted && !hasValidInternalKey) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json; charset=utf-8' } })
    if (internal) {
      const headers = { ...makeUpstreamHeaders(c) }
      if (ctx.trusted && ctx.userId) headers['x-user-id'] = ctx.userId
      const res = await fetch(internal, { method: 'PUT', body: bodyText, headers })
      const buf = await res.arrayBuffer()
      return new Response(buf, { status: res.status, headers: { 'Content-Type': res.headers.get('content-type') || 'application/json; charset=utf-8' } })
    }

    const supabaseUrl = (c.env.SUPABASE_URL || '').replace(/\/$/, '')
    const serviceKey = (c.env.SUPABASE_SERVICE_ROLE_KEY || '').toString()
    if (!supabaseUrl || !serviceKey) return new Response(JSON.stringify({ data: {} }), { status: 200, headers: { 'Content-Type': 'application/json; charset=utf-8' } })

    const payload = JSON.parse(bodyText || '{}')
    const out: Record<string, any> = {}
    for (const [k, v] of Object.entries(payload || {})) {
      try {
        const upUrl = `${supabaseUrl}/rest/v1/site_settings?on_conflict=key`
        const res = await fetch(upUrl, {
          method: 'POST',
          headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
          body: JSON.stringify({ key: k, value: typeof v === 'string' ? v : JSON.stringify(v) })
        })
        const j = await res.json().catch(() => null)
        if (j && Array.isArray(j) && j.length > 0) out[k] = j[0].value || null
      } catch (e) {
        // continue
      }
    }
    return new Response(JSON.stringify({ data: out }), { headers: { 'Content-Type': 'application/json; charset=utf-8' } })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500, headers: { 'Content-Type': 'application/json; charset=utf-8' } })
  }
})

// basePath導出（R2前提のURLやキーからディレクトリ部分を抽出）
function deriveBasePathFromUrl(urlOrKey?: string | null, env?: Env): string | null {
  if (!urlOrKey) return null
  try {
    const pub = (env?.R2_PUBLIC_URL || '').replace(/\/$/, '')
    const bucket = (env?.R2_BUCKET || '').replace(/^\/+|\/+$/g, '')
    let key = urlOrKey
    if (/^https?:\/\//i.test(urlOrKey)) {
      const u = new URL(urlOrKey)
      key = u.pathname.replace(/^\/+/, '')
    }
    if (bucket && key.startsWith(`${bucket}/`)) key = key.slice(bucket.length + 1)
    key = key.replace(/^images\//, '')
    // remove filename
    const parts = key.split('/')
    parts.pop()
    return parts.join('/') || null
  } catch {
    return null
  }
}

// /products はSupabase anon直取得
app.get('/products', zValidator('query', listQuery.partial()), async (c) => {
  const supabase = getSupabase(c.env)
  const q = c.req.query()
  const shallow = q.shallow === 'true'
  const published = q.published === 'true'
  const limit = q.limit ? Math.max(0, parseInt(q.limit)) : null
  const offset = q.offset ? Math.max(0, parseInt(q.offset)) : 0
  const wantCount = q.count === 'true'
  const id = q.id
  const slug = q.slug
  const tag = q.tag

  const baseSelect = '*, images:product_images(*), affiliateLinks:affiliate_links(*)'
  const shallowSelect = 'id,user_id,title,slug,tags,price,published,created_at,updated_at,images:product_images(id,product_id,key,width,height,role)'

  const key = `products${c.req.url.includes('?') ? c.req.url.substring(c.req.url.indexOf('?')) : ''}`
  return cacheJson(c, key, async () => {
    try {
      let query = supabase.from('products').select(shallow ? shallowSelect : baseSelect)
      if (id) query = supabase.from('products').select(shallow ? shallowSelect : baseSelect).eq('id', id)
      else if (slug) query = supabase.from('products').select(shallow ? shallowSelect : baseSelect).eq('slug', slug)
      else if (tag) query = supabase.from('products').select(shallow ? shallowSelect : baseSelect).contains('tags', [tag])
      else if (published) query = supabase.from('products').select(shallow ? shallowSelect : baseSelect).eq('published', true)

      // 単一オーナーの公開サイト前提の場合の追加絞り込み
      // Prefer authenticated user scope when available; otherwise fall back to PUBLIC_OWNER_USER_ID for single-owner sites
      const ctx = await resolveRequestUserContext(c)
      const reqUserId = ctx.trusted ? ctx.userId : null
      if (!id && !slug) {
        if (reqUserId) {
          query = query.eq('user_id', reqUserId)
        } else {
          const ownerId = (c.env.PUBLIC_OWNER_USER_ID || '').trim()
          if (ownerId) query = query.eq('user_id', ownerId)
        }
      }

      let data: any = null
      let error: any = null
      let count: number | null = null

      if (limit && limit > 0) {
        if (wantCount) {
          const res = await (query.range(offset, offset + Math.max(0, limit - 1)) as any).select(shallow ? shallowSelect : baseSelect, { count: 'exact' })
          data = res.data || null
          error = res.error || null
          // @ts-ignore
          count = typeof res.count === 'number' ? res.count : null
        } else {
          const res = await query.range(offset, offset + Math.max(0, limit - 1)).select(shallow ? shallowSelect : baseSelect)
          data = res.data || null
          error = res.error || null
        }
      } else {
        const res = await query.select(shallow ? shallowSelect : baseSelect)
        data = res.data || null
        error = res.error || null
      }

      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })

      const transformed = (data || []).map((p: any) => {
        if (shallow) {
          const firstImg = Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : null
          const imgUrl = firstImg && (firstImg.key || firstImg.url) ? (getPublicImageUrl(firstImg.key, c.env.IMAGES_DOMAIN) || firstImg.url) : null
          const basePath = deriveBasePath(c, firstImg?.key || firstImg?.url || null)
          return {
            id: p.id,
            userId: p.user_id,
            title: p.title,
            slug: p.slug,
            tags: p.tags,
            price: p.price,
            published: p.published,
            createdAt: p.created_at,
            updatedAt: p.updated_at,
            image: imgUrl ? { url: imgUrl, width: firstImg?.width || null, height: firstImg?.height || null, role: firstImg?.role || null, basePath } : null,
          }
        }

        return {
          id: p.id,
          userId: p.user_id,
          title: p.title,
          slug: p.slug,
          shortDescription: p.short_description,
          body: p.body,
          tags: p.tags,
          price: p.price,
          published: p.published,
          createdAt: p.created_at,
          updatedAt: p.updated_at,
          showPrice: p.show_price,
          notes: p.notes,
          relatedLinks: p.related_links,
          images: Array.isArray(p.images)
            ? p.images.map((img: any) => ({
                  id: img.id,
                  productId: img.product_id,
                  key: img.key ?? null,
                  url: getPublicImageUrl(img.key, c.env.IMAGES_DOMAIN) || img.url || null,
                  width: img.width,
                  height: img.height,
                  aspect: img.aspect,
                  role: img.role,
                  basePath: deriveBasePath(c, img.key || img.url),
                }))
            : [],
          affiliateLinks: Array.isArray(p.affiliateLinks)
            ? p.affiliateLinks.map((l: any) => ({ provider: l.provider, url: l.url, label: l.label }))
            : [],
        }
      })

      const meta: Record<string, unknown> = {}
      if (typeof count === 'number') {
        meta.total = count
        meta.limit = limit || null
        meta.offset = offset || 0
      }

      return new Response(JSON.stringify({ data: transformed, meta }), { headers: { 'Content-Type': 'application/json; charset=utf-8' } })
    } catch (e: any) {
      return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500 })
    }
  })
})

function deriveBasePath(c: any, url?: string | null) {
  return deriveBasePathFromUrl(url || null, c.env)
}

// INTERNAL_API_BASE / proxy behavior removed: public-worker serves all admin
// and internal API routes directly. The previous proxy handlers have been
// eliminated to reduce operational complexity and to ensure owner checks are
// always enforced within this Worker.

// Fallback: update user profile via Supabase REST when INTERNAL_API_BASE not configured
app.put('/api/admin/users/:id', async (c) => {
  try {
    const internal = upstream(c, `/api/admin/users/${c.req.param('id')}`)
    const bodyText = await c.req.text()
    if (internal) {
      const res = await fetch(internal, { method: 'PUT', body: bodyText, headers: { ...makeUpstreamHeaders(c) } })
      const buf = await res.arrayBuffer()
      return new Response(buf, { status: res.status, headers: { 'Content-Type': res.headers.get('content-type') || 'application/json; charset=utf-8' } })
    }

    const supabaseUrl = (c.env.SUPABASE_URL || '').replace(/\/$/, '')
    const serviceKey = (c.env.SUPABASE_SERVICE_ROLE_KEY || '').toString()
    if (!supabaseUrl || !serviceKey) return new Response(JSON.stringify({ error: 'internal api not configured' }), { status: 502, headers: { 'Content-Type': 'application/json; charset=utf-8' } })

    const id = c.req.param('id')
    const payload = JSON.parse(bodyText || '{}')
    const ctx = await resolveRequestUserContext(c, payload)
    // Only allow users to update their own profile unless internal key is provided
    if (ctx.authType === 'user-token') {
      if (!ctx.userId || ctx.userId !== id) {
        return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json; charset=utf-8' } })
      }
    } else if (ctx.authType === 'internal-key') {
      // allowed to act on behalf when internal key is used
    } else {
      return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json; charset=utf-8' } })
    }
    // Update profiles table by id (assuming profiles table exists with id column)
    const url = `${supabaseUrl}/rest/v1/profiles?id=eq.${encodeURIComponent(id)}`
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
      body: JSON.stringify(payload)
    })
    const j = await res.json().catch(() => null)
    return new Response(JSON.stringify({ data: j }), { status: res.status, headers: { 'Content-Type': 'application/json; charset=utf-8' } })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500, headers: { 'Content-Type': 'application/json; charset=utf-8' } })
  }
})

// Save Amazon credentials for a user (admin-only). Accepts { id, accessKey, secretKey, associateId }
app.post('/api/admin/amazon/credentials', async (c) => {
  try {
    const internal = upstream(c, '/api/admin/amazon/credentials')
    const bodyText = await c.req.text().catch(() => '')
    const ctx = await resolveRequestUserContext(c)
    const hasValidInternalKey = ctx.authType === 'internal-key'
    if (!ctx.trusted && !hasValidInternalKey) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json; charset=utf-8' } })

    if (internal) {
      const headers = { ...makeUpstreamHeaders(c) }
      if (ctx.trusted && ctx.userId) headers['x-user-id'] = ctx.userId
      const res = await fetch(internal, { method: 'POST', body: bodyText, headers })
      const buf = await res.arrayBuffer()
      return new Response(buf, { status: res.status, headers: { 'Content-Type': res.headers.get('content-type') || 'application/json; charset=utf-8' } })
    }

    const payload = JSON.parse(bodyText || '{}')
    const supabaseUrl = (c.env.SUPABASE_URL || '').replace(/\/$/, '')
    const serviceKey = (c.env.SUPABASE_SERVICE_ROLE_KEY || '').toString()
    if (!supabaseUrl || !serviceKey) return new Response(JSON.stringify({ error: 'not_configured' }), { status: 500, headers: { 'Content-Type': 'application/json; charset=utf-8' } })

    const id = payload?.id || payload?.userId || 'default'
    const accessKey = payload?.accessKey || payload?.access_key || null
    const secretKey = payload?.secretKey || payload?.secret_key || null
    const associateId = payload?.associateId || payload?.associate_id || null

    const upUrl = `${supabaseUrl}/rest/v1/amazon_credentials?on_conflict=id`
    const res = await fetch(upUrl, {
      method: 'POST',
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
      body: JSON.stringify({ id, access_key: accessKey, secret_key: secretKey, associate_id: associateId })
    })

    if (!res.ok) return new Response(JSON.stringify({ error: 'upsert_failed' }), { status: res.status, headers: { 'Content-Type': 'application/json; charset=utf-8' } })
    const j = await res.json().catch(() => null)
    return new Response(JSON.stringify({ data: j && Array.isArray(j) && j.length > 0 ? j[0] : null }), { headers: { 'Content-Type': 'application/json; charset=utf-8' } })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500, headers: { 'Content-Type': 'application/json; charset=utf-8' } })
  }
})

// CASE A: R2へ画像保存するWorkerエンドポイント
// フォーマット: images/YYYY/MM/DD/<random>-<filename>
// 返却: { ok: true, result: { key, publicUrl, size, contentType } }
async function handleUploadImage(c: any) {
  try {
    // Require authenticated/admin user or internal-key to upload images
    const ctx = await resolveRequestUserContext(c)
    const hasValidInternalKey = ctx.authType === 'internal-key'
    if (!ctx.trusted && !hasValidInternalKey) {
      const base = { 'Content-Type': 'application/json; charset=utf-8' }
      const merged = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), base)
      return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: merged })
    }
    const ct = c.req.header('content-type') || ''
    if (!ct.includes('multipart/form-data')) {
      const base = { 'Content-Type': 'application/json; charset=utf-8' }
      const merged = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), base)
      return new Response(JSON.stringify({ error: 'multipart/form-data required' }), { status: 400, headers: merged })
    }
    const form = await c.req.formData()
    const file = form.get('file') as File | null
    // Allow client to suggest a key. If provided, we'll use it (after sanitization)
    const clientKeyRaw = (form.get('key') as string) || (form.get('desiredKey') as string) || ''
    if (!file) {
      const base = { 'Content-Type': 'application/json; charset=utf-8' }
      const merged = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), base)
      return new Response(JSON.stringify({ error: 'file is required' }), { status: 400, headers: merged })
    }

    const buf = await file.arrayBuffer()
    const now = new Date()
    const yyyy = String(now.getFullYear())
    const mm = String(now.getMonth() + 1).padStart(2, '0')
    const dd = String(now.getDate()).padStart(2, '0')
    const rand = Math.random().toString(36).slice(2, 10)
    let safeName = (file.name || 'upload').replace(/[^a-zA-Z0-9._-]/g, '_')
    // If filename has no extension, try to infer from content type and append
    if (!/\.[a-zA-Z0-9]+$/.test(safeName)) {
      try {
        const mime = (file.type || '').toLowerCase()
        const mimeToExt: Record<string, string> = {
          'image/jpeg': 'jpg',
          'image/jpg': 'jpg',
          'image/png': 'png',
          'image/gif': 'gif',
          'image/webp': 'webp',
          'image/svg+xml': 'svg'
        }
        const ext = mimeToExt[mime] || (mime && mime.split('/')[1]) || ''
        if (ext) safeName = `${safeName}.${ext.replace(/[^a-z0-9]/gi, '')}`
      } catch (e) {
        // ignore and keep original safeName
      }
    }
    const bucket = (c.env.R2_BUCKET || 'images').replace(/^\/+|\/+$/g, '')
    // If client provided a key, sanitize and use it; otherwise generate one.
    let key: string
    if (clientKeyRaw && typeof clientKeyRaw === 'string') {
      // Strip any leading/trailing slashes and disallow .. segments
      let cleaned = clientKeyRaw.replace(/^\/+/, '').replace(/\/+$|\.\./g, '')
      // If cleaned looks like a filename (no directories), prepend date path
      if (!/\//.test(cleaned)) cleaned = `${yyyy}/${mm}/${dd}/${cleaned}`
      // Ensure filename portion is safe
      const parts = cleaned.split('/')
      const last = parts.pop() || safeName
      const cleanedLast = last.replace(/[^a-zA-Z0-9._-]/g, '_')
      parts.push(cleanedLast)
      const joined = parts.join('/')
      key = `${bucket}/${joined}`.replace(/\/+/g, '/')
    } else {
      // Store objects under `images/YYYY/MM/DD/...` within the R2 bucket.
      key = `images/${yyyy}/${mm}/${dd}/${rand}-${safeName}`
    }

    // Save to R2
    // Use key path relative to the R2 bucket (strip any leading bucket prefix)
    const putKey = key.replace(new RegExp(`^${bucket}\/`), '')
    // @ts-ignore IMAGES binding from wrangler.toml
    const putRes = await c.env.IMAGES.put(putKey, buf, { httpMetadata: { contentType: file.type || 'application/octet-stream', cacheControl: 'public, max-age=2592000' } })
    if (!putRes) {
      const base = { 'Content-Type': 'application/json; charset=utf-8' }
      const merged = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), base)
      return new Response(JSON.stringify({ error: 'failed to put object' }), { status: 500, headers: merged })
    }

    // Return a worker-relative publicUrl so clients can use it for preview
    // and so frontend code can treat it as a key-like value if desired.
    // Keep canonical `key` separately (e.g. `images/YYYY/...`).
    const imagesDomain = ((c.env.IMAGES_DOMAIN as string) || (c.env.R2_PUBLIC_URL as string) || '').replace(/\/$/, '')
    // publicUrl is the worker-served path (relative) to avoid returning
    // provider-specific hostnames or accidental blob/file names. Example: `/images/<putKey>`
    let publicUrl = `/images/${putKey}`

    // Also prepare a date-prefixed public URL that includes configured domain
    // for backward compatibility (not used for DB). This is optional.
    let publicUrlDatePrefixed: string | null = null
    if (imagesDomain) {
      publicUrlDatePrefixed = `${imagesDomain}/${putKey}`
      try {
        const u2 = new URL(publicUrlDatePrefixed)
        u2.search = ''
        u2.hash = ''
        publicUrlDatePrefixed = u2.toString().replace(/\/$/, '')
      } catch (e) {
        publicUrlDatePrefixed = publicUrlDatePrefixed.split(/[?#]/)[0].replace(/\/$/, '')
      }
      if (!/^https?:\/\//i.test(publicUrlDatePrefixed)) publicUrlDatePrefixed = `https://${publicUrlDatePrefixed}`
    }

    // Provide a worker-served fallback URL so clients can use it when the
    // configured `IMAGES_DOMAIN` is not publicly accessible.
    const workerHost = ((c.env.WORKER_PUBLIC_HOST as string) || 'https://public-worker.shirasame-official.workers.dev').replace(/\/$/, '')
    const workerUrl = `${workerHost}/images/${putKey}`

    // Parse optional aspect/ratio and caption (alt text) info from form
    const ratioRaw = (form.get('ratio') as string) || (form.get('aspect') as string) || ''
    const aspect = ratioRaw ? ratioRaw.toString() : null
    const captionRaw = (form.get('alt') as string) || (form.get('caption') as string) || (form.get('description') as string) || ''
    const caption = captionRaw ? captionRaw.toString() : null

    // Attempt to persist metadata immediately (best-effort). This makes
    // uploads durable immediately without requiring a separate
    // POST /api/images/complete call from clients. If the service role
    // key is not configured, we still return success but log a warning.
    try {
      const ctx2 = ctx // reuse resolved context above
      const effectiveUserId = ctx2.userId || null
      const supabaseUrl = (c.env.SUPABASE_URL || '').replace(/\/$/, '')
      const serviceKey = (c.env.SUPABASE_SERVICE_ROLE_KEY || '').toString()
      if (supabaseUrl && serviceKey) {
        // Persist DB key including bucket prefix (e.g. `images/YYYY/MM/DD/...`) so
        // stored keys match the project "key-only" policy.
        const metadataObj: any = {}
        if (aspect) metadataObj.aspect = aspect
        if (caption) metadataObj.caption = caption
        const insertBody = [{ key, filename: safeName, metadata: Object.keys(metadataObj).length ? metadataObj : null, user_id: effectiveUserId || null, created_at: new Date().toISOString() }]
        const upsertUrl = `${supabaseUrl}/rest/v1/images?on_conflict=key`
        // Fire-and-forget but await so we can log failures
        const upsertRes = await fetch(upsertUrl, {
          method: 'POST',
          headers: {
            apikey: serviceKey,
            Authorization: `Bearer ${serviceKey}`,
            'Content-Type': 'application/json',
            Prefer: 'resolution=ignore-duplicates,return=representation'
          },
          body: JSON.stringify(insertBody),
        })
        if (!upsertRes.ok) {
          try { console.warn('[images] failed to persist image metadata on upload', await upsertRes.text().catch(() => '')) } catch(e){}
        }
      } else {
        try { console.warn('SUPABASE_SERVICE_ROLE_KEY not configured; upload did not persist to DB') } catch(e){}
      }
    } catch (e:any) {
      try { console.warn('images: immediate persist failed', String(e?.message || e)) } catch(e){}
    }

    // Optional: allow callers to request assignment of the uploaded key to another table
    // Supported `assign` values (multipart form field):
    //  - 'users.profile'         : Set `users.profile_image_key = <key>` for target user
    //  - 'users.header_append'   : Append `key` into `users.header_image_keys` array for target user
    //  - 'product'               : Insert a row into `product_images` with product_id=targetId and key
    // Security: assignment only performed when request is trusted (token or internal-key). If internal-key is used,
    // the client may specify `targetId`. If token-authenticated, we default target to the token's user id unless
    // an internal-key is present.
    try {
      const assign = (form.get('assign') as string) || ''
      if (assign && (ctx.trusted || hasValidInternalKey)) {
        const supabaseUrl2 = (c.env.SUPABASE_URL || '').replace(/\/$/, '')
        const serviceKey2 = (c.env.SUPABASE_SERVICE_ROLE_KEY || '').toString()
        if (supabaseUrl2 && serviceKey2) {
          // target id may be provided in form as 'targetId' or 'userId' or 'productId'
          const targetId = (form.get('targetId') as string) || (form.get('userId') as string) || (form.get('productId') as string) || null
          // Decide effective target for user-scoped assigns
          const effectiveTargetUserId = targetId || ctx.userId || null

          if (assign === 'users.profile') {
            if (!effectiveTargetUserId) {
              try { console.warn('[images] assign=users.profile requested but no target user id available') } catch(e){}
            } else {
              const patchUrl = `${supabaseUrl2}/rest/v1/users?id=eq.${effectiveTargetUserId}`
              try {
                const patchRes = await fetch(patchUrl, {
                  method: 'PATCH',
                  headers: { apikey: serviceKey2, Authorization: `Bearer ${serviceKey2}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
                  body: JSON.stringify({ profile_image_key: key })
                })
                if (!patchRes.ok) {
                  try { console.warn('[images] failed to assign profile image', await patchRes.text().catch(() => '')) } catch(e){}
                }
              } catch (e) {
                try { console.warn('[images] exception assigning profile image', String(e)) } catch(e){}
              }
            }
          } else if (assign === 'users.header_append') {
            if (!effectiveTargetUserId) {
              try { console.warn('[images] assign=users.header_append requested but no target user id available') } catch(e){}
            } else {
              const getUrl = `${supabaseUrl2}/rest/v1/users?select=header_image_keys&id=eq.${effectiveTargetUserId}`
              try {
                const getRes = await fetch(getUrl, { headers: { apikey: serviceKey2, Authorization: `Bearer ${serviceKey2}` } })
                if (getRes.ok) {
                  const rows = await getRes.json().catch(() => null)
                  let arr: any[] = []
                  if (Array.isArray(rows) && rows.length > 0) {
                    const cur = rows[0].header_image_keys
                    if (Array.isArray(cur)) arr = cur.slice()
                    else if (cur) arr = [cur]
                  }
                  arr.push(key)
                  const patchUrl = `${supabaseUrl2}/rest/v1/users?id=eq.${effectiveTargetUserId}`
                  const patchRes = await fetch(patchUrl, {
                    method: 'PATCH',
                    headers: { apikey: serviceKey2, Authorization: `Bearer ${serviceKey2}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
                    body: JSON.stringify({ header_image_keys: arr })
                  })
                  if (!patchRes.ok) {
                    try { console.warn('[images] failed to append header image key', await patchRes.text().catch(() => '')) } catch(e){}
                  }
                } else {
                  try { console.warn('[images] failed to fetch user for header append', await getRes.text().catch(() => '')) } catch(e){}
                }
              } catch (e) {
                try { console.warn('[images] exception during header append', String(e)) } catch(e){}
              }
            }
          } else if (assign === 'product') {
            // Insert into product_images: requires productId in form
            const productId = (form.get('productId') as string) || targetId || null
            if (!productId) {
              try { console.warn('[images] assign=product requested but no productId provided') } catch(e){}
            } else {
              const insertUrl = `${supabaseUrl2}/rest/v1/product_images`
              const payload: any = { product_id: productId, key, created_at: new Date().toISOString() }
              if (aspect) payload.aspect = aspect
              if (caption) payload.caption = caption
              try {
                const insRes = await fetch(insertUrl, {
                  method: 'POST',
                  headers: { apikey: serviceKey2, Authorization: `Bearer ${serviceKey2}`, 'Content-Type': 'application/json', Prefer: 'resolution=ignore-duplicates,return=representation' },
                  body: JSON.stringify([payload])
                })
                if (!insRes.ok) {
                  try { console.warn('[images] failed to insert product_images', await insRes.text().catch(() => '')) } catch(e){}
                }
              } catch (e) {
                try { console.warn('[images] exception inserting product_images', String(e)) } catch(e){}
              }
            }
          } else {
            try { console.warn('[images] unknown assign value:', assign) } catch(e){}
          }
        } else {
          try { console.warn('SUPABASE_SERVICE_ROLE_KEY not configured; cannot perform assign operations') } catch(e){}
        }
      }
    } catch (e:any) {
      try { console.warn('images: assign handling failed', String(e?.message || e)) } catch(e){}
    }

    // Per CASE A (key-only) policy: return only the canonical `key`.
    // Do not return provider hostnames, variants or additional metadata here.
    {
      const base = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=60' }
      const merged = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), base)
      return new Response(JSON.stringify({ key }), { headers: merged })
    }
  } catch (e: any) {
    const base = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }
    const merged = Object.assign({}, computeCorsHeaders((c as any).req?.header?.('Origin') || null, (c as any).env), base)
    return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500, headers: merged })
  }
}

// Register upload handler under multiple paths for compatibility with
// different proxying conventions (`/upload-image`, `/images/upload`, `/api/images/upload`).
app.post('/upload-image', handleUploadImage)
app.post('/images/upload', handleUploadImage)
app.post('/api/images/upload', handleUploadImage)

// Compatibility alias: some clients call `/images/save` for metadata persist.
// Forward to the canonical `/api/images/complete` so older clients keep working.
app.post('/images/save', async (c) => {
  try {
    // Call the canonical handler directly to avoid re-entering the `/api/*` proxy
    return await handleImagesComplete(c)
  } catch (e: any) {
    const base = { 'Content-Type': 'application/json; charset=utf-8' }
    const merged = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), base)
    return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500, headers: merged })
  }
})

// images/complete: Persist uploaded image metadata (key-only policy)
// Extracted into a reusable function so compatibility aliases can call
// the same logic without proxying back through the `/api/*` proxy route.
async function handleImagesComplete(c: any) {
  try {
    const text = await c.req.text().catch(() => '')
    let payload: any = {}
    try { payload = text ? JSON.parse(text) : {} } catch { payload = {} }

    const key = (payload?.key || payload?.imageKey || payload?.id || '').toString()
    if (!key) {
      const base = { 'Content-Type': 'application/json; charset=utf-8' }
      const merged = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), base)
      return new Response(JSON.stringify({ error: 'key is required' }), { status: 400, headers: merged })
    }

    // Build record to insert into `images` table. We store key only (no full URL).
    const filename = payload?.filename || key.split('/').pop() || null
    const metadata: any = {}
    if (payload?.target) metadata.target = payload.target
    if (payload?.aspect) metadata.aspect = payload.aspect
    if (payload?.extra) metadata.extra = payload.extra

    // Resolve user context centrally (token > internal-key > none)
    const ctx = await resolveRequestUserContext(c, payload)
    if (!ctx.trusted) {
      const base = { 'Content-Type': 'application/json; charset=utf-8' }
      const merged = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), base)
      return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: merged })
    }

    // effectiveUserId: token-authenticated users or internal-key supplied user id
    const effectiveUserId = ctx.userId || null

    const supabaseUrl = (c.env.SUPABASE_URL || '').replace(/\/$/, '')
    const serviceKey = (c.env.SUPABASE_SERVICE_ROLE_KEY || '').toString()
    // Determine if this request intends to assign the uploaded key to a user profile
    const wantsAssignToProfile = (payload?.assign === 'users.profile') || (payload?.target === 'profile')
    const assignTargetUserId = payload?.userId || effectiveUserId || null

    async function tryAssignProfile(keyToAssign: string) {
      try {
        if (!wantsAssignToProfile) return
        if (!assignTargetUserId) return
        if (!supabaseUrl || !serviceKey) return
        const patchUrl = `${supabaseUrl}/rest/v1/users?id=eq.${assignTargetUserId}`
        const patchRes = await fetch(patchUrl, {
          method: 'PATCH',
          headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
          body: JSON.stringify({ profile_image_key: keyToAssign })
        })
        if (!patchRes.ok) {
          try { console.warn('[images/complete] failed to assign profile_image_key', await patchRes.text().catch(() => '')) } catch(e){}
        }
      } catch (e) {
        try { console.warn('[images/complete] exception assigning profile image', String(e)) } catch(e){}
      }
    }
    if (!supabaseUrl || !serviceKey) {
      // If service role key not configured, do not fail hard; return success but log.
      try { console.warn('SUPABASE_SERVICE_ROLE_KEY not configured; images/complete did not persist to DB') } catch {}
      return new Response(JSON.stringify({ key }), { status: 200, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' } })
    }

    // Atomic upsert using Postgres ON CONFLICT DO NOTHING pattern via Supabase REST.
    // We attempt an INSERT with `on_conflict=key` and `Prefer: resolution=ignore-duplicates,return=representation`.
    // If the insert is ignored due to an existing row (race), the POST returns an empty array; in that case
    // we fetch the existing row and return existing=true. This avoids race conditions.
    try {
      const insertBody = [{ key, filename, metadata: Object.keys(metadata).length ? metadata : null, user_id: effectiveUserId || null, created_at: new Date().toISOString() }]
      const upsertUrl = `${supabaseUrl}/rest/v1/images?on_conflict=key`
      const upsertRes = await fetch(upsertUrl, {
        method: 'POST',
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=ignore-duplicates,return=representation'
        },
        body: JSON.stringify(insertBody),
      })

      // Successful atomic upsert path (requires DB unique constraint on images.key)
      if (upsertRes.ok) {
        const inserted = await upsertRes.json().catch(() => [])
        if (Array.isArray(inserted) && inserted.length > 0) {
          await tryAssignProfile(key)
          const base = { 'Content-Type': 'application/json; charset=utf-8' }
          const merged = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), base)
          return new Response(JSON.stringify({ key }), { status: 200, headers: merged })
        }

        // Insert was ignored due to conflict — fetch the existing record
        try {
          const encodedKey = encodeURIComponent(key)
          const qUrl = `${supabaseUrl}/rest/v1/images?select=id,key,filename,metadata,user_id,created_at&key=eq.${encodedKey}&limit=1`
          const qRes = await fetch(qUrl, { method: 'GET', headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } })
            if (qRes.ok) {
            // Return key-only on success per key-only policy
            await tryAssignProfile(key)
            const base = { 'Content-Type': 'application/json; charset=utf-8' }
            const merged = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), base)
            return new Response(JSON.stringify({ key }), { status: 200, headers: merged })
          }
        } catch (e) {
          const base = { 'Content-Type': 'application/json; charset=utf-8' }
          const merged = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), base)
          return new Response(JSON.stringify({ key }), { status: 200, headers: merged })
        }
        await tryAssignProfile(key)
        const base = { 'Content-Type': 'application/json; charset=utf-8' }
        const merged = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), base)
        return new Response(JSON.stringify({ key }), { status: 200, headers: merged })
      }

      // If upsert failed, inspect the response for Postgres-on-conflict support error (42P10)
      const upsertText = await upsertRes.text().catch(() => '')
      const isNoOnConflict = String(upsertText).includes('42P10') || String(upsertText).toLowerCase().includes('no unique or exclusion constraint') || String(upsertText).toLowerCase().includes('on conflict')

      // Try RPC-based atomic insert-if-not-exists if the DB provides such a function
      if (isNoOnConflict) {
        try {
          const rpcUrl = `${supabaseUrl}/rpc/images_insert_if_not_exists`
          const rpcRes = await fetch(rpcUrl, {
            method: 'POST',
            headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ p_key: key, p_filename: filename, p_metadata: metadata && Object.keys(metadata).length ? metadata : null, p_user_id: effectiveUserId || null }),
          })
            if (rpcRes.ok) {
            // RPC succeeded; still return key-only to keep API strict.
            await tryAssignProfile(key)
            const base = { 'Content-Type': 'application/json; charset=utf-8' }
            const merged = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), base)
            return new Response(JSON.stringify({ key }), { status: 200, headers: merged })
          }
        } catch (e) {
          // ignore and fallback to SELECT/INSERT loop below
        }
      }

      // Final fallback: SELECT -> INSERT with retry to reduce race window.
      // This is not as strong as server-side transaction, but only used when
      // DB lacks ON CONFLICT support or RPC. The production-safe path is to
      // run the DB dedupe + unique index (see docs). We attempt 3 tries.
      try {
        const encodedKey = encodeURIComponent(key)
        for (let attempt = 0; attempt < 3; attempt++) {
          // Check existing
          const qUrl = `${supabaseUrl}/rest/v1/images?select=id,key,filename,metadata,user_id,created_at&key=eq.${encodedKey}&limit=1`
          const qRes = await fetch(qUrl, { method: 'GET', headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } })
          if (qRes.ok) {
            const existing = await qRes.json().catch(() => null)
            if (Array.isArray(existing) && existing.length > 0) {
              await tryAssignProfile(key)
              return new Response(JSON.stringify({ key }), { status: 200, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' } })
            }
          }

          // Not found -> attempt insert
          const insBody = [{ key, filename, metadata: Object.keys(metadata).length ? metadata : null, user_id: effectiveUserId || null, created_at: new Date().toISOString() }]
          const insUrl = `${supabaseUrl}/rest/v1/images`
          const insRes = await fetch(insUrl, { method: 'POST', headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json', Prefer: 'return=representation' }, body: JSON.stringify(insBody) })
            if (insRes.ok) {
              const rec = await insRes.json().catch(() => [])
                if (Array.isArray(rec) && rec.length > 0) {
                await tryAssignProfile(key)
                const base = { 'Content-Type': 'application/json; charset=utf-8' }
                const merged = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), base)
                return new Response(JSON.stringify({ key }), { status: 200, headers: merged })
              }
            } else {
            const txt = await insRes.text().catch(() => '')
            // If this indicates a duplicate was created concurrently, treat as existing and return
            if (String(txt).toLowerCase().includes('duplicate') || String(txt).includes('unique')) {
              // Re-query to return existing record
              const reQ = await fetch(qUrl, { method: 'GET', headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } })
              if (reQ.ok) {
                const existing = await reQ.json().catch(() => null)
                  if (Array.isArray(existing) && existing.length > 0) {
                  await tryAssignProfile(key)
                  const base = { 'Content-Type': 'application/json; charset=utf-8' }
                  const merged = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), base)
                  return new Response(JSON.stringify({ key }), { status: 200, headers: merged })
                }
              }
            }
          }

          // Small jitter before retry
          await new Promise((res) => setTimeout(res, 100 + Math.floor(Math.random() * 200)))
        }
        // After retries, return error
        const base = { 'Content-Type': 'application/json; charset=utf-8' }
        const merged = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), base)
        return new Response(JSON.stringify({ error: 'failed to persist image metadata after retries' }), { status: 500, headers: merged })
      } catch (e: any) {
        const base = { 'Content-Type': 'application/json; charset=utf-8' }
        const merged = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), base)
        return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500, headers: merged })
      }
    } catch (e: any) {
      const base = { 'Content-Type': 'application/json; charset=utf-8' }
      const merged = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), base)
      return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500, headers: merged })
    }
  } catch (e: any) {
    const base = { 'Content-Type': 'application/json; charset=utf-8' }
    const merged = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), base)
    return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500, headers: merged })
  }
}

// register the canonical route to use the reusable handler
app.post('/api/images/complete', handleImagesComplete)

// DELETE /api/images/:key - remove image from R2 and DB (authenticated)
app.delete('/api/images/:key', async (c) => {
  try {
    const keyParam = c.req.param('key')
    if (!keyParam) return new Response(JSON.stringify({ error: 'key required' }), { status: 400, headers: { 'Content-Type': 'application/json; charset=utf-8' } })

    // Resolve user context and ensure authorized
    const ctx = await resolveRequestUserContext(c)
    const allowed = ctx.trusted || ctx.authType === 'internal-key'
    if (!allowed) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json; charset=utf-8' } })

    const key = decodeURIComponent(keyParam)
    // Delete from R2 (best-effort)
    try {
      // @ts-ignore R2 binding
      if (c.env.IMAGES) {
        await c.env.IMAGES.delete(key).catch(() => {})
      }
    } catch (e) {
      try { console.warn('R2 delete failed', e) } catch(e){}
    }

    // Remove DB row if service key present
    try {
      const supabaseUrl = (c.env.SUPABASE_URL || '').replace(/\/$/, '')
      const serviceKey = (c.env.SUPABASE_SERVICE_ROLE_KEY || '').toString()
      if (supabaseUrl && serviceKey) {
        const deleteUrl = `${supabaseUrl}/rest/v1/images?key=eq.${encodeURIComponent(key)}`
        const delRes = await fetch(deleteUrl, { method: 'DELETE', headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } })
        if (!delRes.ok) {
          try { console.warn('Failed to delete images row', await delRes.text().catch(() => '')) } catch(e){}
        }
      } else {
        try { console.warn('SUPABASE_SERVICE_ROLE_KEY not configured; DB row not deleted for', key) } catch(e){}
      }
    } catch (e:any) {
      try { console.warn('images delete DB operation failed', String(e?.message || e)) } catch(e){}
    }

    return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json; charset=utf-8' } })
  } catch (e:any) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500, headers: { 'Content-Type': 'application/json; charset=utf-8' } })
  }
})

// Cloudflare Images direct-upload presigner for admin UI
app.post('/api/images/direct-upload', async (c) => {
  try {
    // Require authenticated/admin user or internal-key to get direct-upload token
    const ctx = await resolveRequestUserContext(c)
    const hasValidInternalKey = ctx.authType === 'internal-key'
    if (!ctx.trusted && !hasValidInternalKey) return new Response(JSON.stringify({ ok: false, error: 'unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json; charset=utf-8' } })
    const account = (c.env.CLOUDFLARE_ACCOUNT_ID || '').toString()
    const token = (c.env.CLOUDFLARE_IMAGES_API_TOKEN || '').toString()
    if (!account || !token) {
      return new Response(JSON.stringify({ ok: false, error: 'Cloudflare Images credentials not configured' }), { status: 500, headers: { 'Content-Type': 'application/json; charset=utf-8' } })
    }

    const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/images/v2/direct_upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    })
    const json = await res.json().catch(() => ({ ok: false }))
    return new Response(JSON.stringify(json), { status: res.status, headers: { 'Content-Type': 'application/json; charset=utf-8' } })
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: String(e?.message || e) }), { status: 500, headers: { 'Content-Type': 'application/json; charset=utf-8' } })
  }
})
// Also accept `/images/direct-upload` (some proxies strip the `/api` prefix).
app.post('/images/direct-upload', async (c) => {
  try {
    // Require authenticated/admin user or internal-key to get direct-upload token
    const ctx = await resolveRequestUserContext(c)
    const hasValidInternalKey = ctx.authType === 'internal-key'
    if (!ctx.trusted && !hasValidInternalKey) return new Response(JSON.stringify({ ok: false, error: 'unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json; charset=utf-8' } })
    const account = (c.env.CLOUDFLARE_ACCOUNT_ID || '').toString()
    const token = (c.env.CLOUDFLARE_IMAGES_API_TOKEN || '').toString()
    if (!account || !token) {
      return new Response(JSON.stringify({ ok: false, error: 'Cloudflare Images credentials not configured' }), { status: 500, headers: { 'Content-Type': 'application/json; charset=utf-8' } })
    }

    const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/images/v2/direct_upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    })
    const json = await res.json().catch(() => ({ ok: false }))
    return new Response(JSON.stringify(json), { status: res.status, headers: { 'Content-Type': 'application/json; charset=utf-8' } })
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: String(e?.message || e) }), { status: 500, headers: { 'Content-Type': 'application/json; charset=utf-8' } })
  }
})

// Authentication: whoami endpoint for admin UI
app.get('/api/auth/whoami', async (c) => {
  try {
    const supabaseUrl = (c.env.SUPABASE_URL || '').replace(/\/$/, '')
    if (!supabaseUrl) return new Response(JSON.stringify({ ok: false }), { status: 200, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' } })
    // Use shared helper: extract token (Authorization or cookie) and fetch user
    const user = await getUserFromRequest(c)
    if (!user) return new Response(JSON.stringify({ ok: false }), { status: 401, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' } })
    return new Response(JSON.stringify({ ok: true, user }), { status: 200, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' } })
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: String(e?.message || e) }), { status: 500, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' } })
  }
})

// Set server-side session cookies (called by admin-site after sign-in)
app.post('/api/auth/session', async (c) => {
  try {
    const payload = await c.req.json().catch(() => ({}))
    const access = payload?.access_token || ''
    const refresh = payload?.refresh_token || ''
    if (!access) return new Response(JSON.stringify({ ok: false, error: 'missing_access_token' }), { status: 400, headers: { 'Content-Type': 'application/json; charset=utf-8' } })

    const headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8' })
    // Ensure cookies are scoped to the admin domain so the browser will send
    // them when calling admin-side APIs (whoami). Do NOT log token values.
    const cookieOpts = 'Path=/; HttpOnly; Secure; SameSite=None; Domain=.shirasame.com'
    headers.append('Set-Cookie', `sb-access-token=${encodeURIComponent(access)}; ${cookieOpts}`)
    if (refresh) headers.append('Set-Cookie', `sb-refresh-token=${encodeURIComponent(refresh)}; ${cookieOpts}`)

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers })
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: String(e?.message || e) }), { status: 500, headers: { 'Content-Type': 'application/json; charset=utf-8' } })
  }
})

// Compatibility: also accept `/auth/*` (no `/api` prefix) for older client calls
// These mirror the `/api/auth/*` endpoints so that requests sent to a host
// like `https://api.shirasame.com/auth/*` continue to work even if the
// worker is mounted at that hostname without an `/api` prefix.
app.post('/auth/session', async (c) => {
  try {
    const payload = await c.req.json().catch(() => ({}))
    const access = payload?.access_token || ''
    const refresh = payload?.refresh_token || ''
    if (!access) return new Response(JSON.stringify({ ok: false, error: 'missing_access_token' }), { status: 400, headers: { 'Content-Type': 'application/json; charset=utf-8' } })

    const headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8' })
    const cookieOpts = 'Path=/; HttpOnly; Secure; SameSite=None; Domain=.shirasame.com'
    headers.append('Set-Cookie', `sb-access-token=${encodeURIComponent(access)}; ${cookieOpts}`)
    if (refresh) headers.append('Set-Cookie', `sb-refresh-token=${encodeURIComponent(refresh)}; ${cookieOpts}`)

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers })
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: String(e?.message || e) }), { status: 500, headers: { 'Content-Type': 'application/json; charset=utf-8' } })
  }
})

app.post('/auth/logout', async (c) => {
  try {
    const headers = new Headers(Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env)))
    headers.set('Content-Type', 'application/json; charset=utf-8')
    headers.append('Set-Cookie', `sb-access-token=; Path=/; HttpOnly; SameSite=None; Max-Age=0; Secure; Domain=.shirasame.com`)
    headers.append('Set-Cookie', `sb-refresh-token=; Path=/; HttpOnly; SameSite=None; Max-Age=0; Secure; Domain=.shirasame.com`)
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers })
  } catch (e: any) {
    const base = { 'Content-Type': 'application/json; charset=utf-8' }
    const merged = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), base)
    return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500, headers: merged })
  }
})

app.get('/auth/whoami', async (c) => {
  try {
    const supabaseUrl = (c.env.SUPABASE_URL || '').replace(/\/$/, '')
    if (!supabaseUrl) return new Response(JSON.stringify({ ok: false }), { status: 200, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' } })
    const user = await getUserFromRequest(c)
    if (!user) return new Response(JSON.stringify({ ok: false }), { status: 401, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' } })
    return new Response(JSON.stringify({ ok: true, user }), { status: 200, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' } })
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: String(e?.message || e) }), { status: 500, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' } })
  }
})

// Refresh access token using sb-refresh-token cookie
app.post('/api/auth/refresh', async (c) => {
  try {
    const cookieHeader = c.req.header('cookie') || ''
    const match = cookieHeader.split(';').map((s: string) => s.trim()).find((s: string) => s.startsWith('sb-refresh-token='))
    const refreshToken = match ? decodeURIComponent(match.split('=')[1]) : null
    if (!refreshToken) return new Response(JSON.stringify({ ok: false, error: 'no_refresh_token' }), { status: 401, headers: { 'Content-Type': 'application/json; charset=utf-8' } })

    const supabaseBase = (c.env.SUPABASE_URL || '').replace(/\/$/, '')
    const anonKey = (c.env.SUPABASE_ANON_KEY || '')
    const serviceKey = (c.env.SUPABASE_SERVICE_ROLE_KEY || '') || null
    if (!supabaseBase) return new Response(JSON.stringify({ ok: false, error: 'SUPABASE_URL not configured' }), { status: 500, headers: { 'Content-Type': 'application/json; charset=utf-8' } })

    const tokenUrl = `${supabaseBase}/auth/v1/token`
    const body = `grant_type=refresh_token&refresh_token=${encodeURIComponent(refreshToken)}`
    const reqHeaders: Record<string, string> = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'apikey': anonKey as string,
    }
    if (serviceKey) reqHeaders['Authorization'] = 'Bearer ' + serviceKey

    const tokenRes = await fetch(tokenUrl, { method: 'POST', headers: reqHeaders, body })
    const tokenJson = await tokenRes.json().catch(() => null)
    if (!tokenRes.ok || !tokenJson) return new Response(JSON.stringify({ ok: false, error: tokenJson || 'token_refresh_failed' }), { status: 401, headers: { 'Content-Type': 'application/json; charset=utf-8' } })

    const accessToken = tokenJson.access_token || null
    const newRefreshToken = tokenJson.refresh_token || null
    const expiresIn = parseInt(String(tokenJson.expires_in || '0'), 10) || null

    const headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8' })
    const cookieBase = 'Path=/; HttpOnly; Secure; SameSite=None; Domain=.shirasame.com'
    if (accessToken) {
      const maxAge = expiresIn && expiresIn > 0 ? Math.min(expiresIn, 60 * 60 * 24 * 7) : 60 * 60 * 24 * 7
      headers.append('Set-Cookie', `sb-access-token=${encodeURIComponent(accessToken)}; ${cookieBase}; Max-Age=${maxAge}`)
    }
    if (newRefreshToken) {
      headers.append('Set-Cookie', `sb-refresh-token=${encodeURIComponent(newRefreshToken)}; ${cookieBase}; Max-Age=${60 * 60 * 24 * 30}`)
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers })
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: String(e?.message || e) }), { status: 500, headers: { 'Content-Type': 'application/json; charset=utf-8' } })
  }
})

// Logout: clear session cookies
app.post('/api/auth/logout', async (c) => {
  try {
    const headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8' })
    headers.append('Set-Cookie', `sb-access-token=; Path=/; HttpOnly; SameSite=None; Max-Age=0; Secure; Domain=.shirasame.com`)
    headers.append('Set-Cookie', `sb-refresh-token=; Path=/; HttpOnly; SameSite=None; Max-Age=0; Secure; Domain=.shirasame.com`)
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers })
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: String(e?.message || e) }), { status: 500, headers: { 'Content-Type': 'application/json; charset=utf-8' } })
  }
})
    
    // Serve images directly from R2 through this Worker as a fallback
    // Accept both `/images/*` and date-prefixed paths like `/YYYY/MM/DD/*` so
    // the images domain can be pointed directly at this worker and older
    // URLs without the `/images/` prefix still resolve.
    async function tryServeImageCandidates(c: any, rawPath: string) {
      try {
        const bucket = (c.env.R2_BUCKET || 'images').replace(/^\/+|\/+$/g, '')
        // Candidate keys: as-requested, with/without bucket prefix, and with images/ prefix
        const candidates = [
          rawPath,
          rawPath.replace(new RegExp(`^${bucket}\/`), ''),
          `${bucket}/${rawPath}`,
          `images/${rawPath}`,
          `${bucket}/images/${rawPath}`,
        ]

        let obj: any = null
        for (const k of candidates) {
          try {
            obj = await c.env.IMAGES.get(k, { allowIncomplete: false })
            if (obj) {
              const buf = await obj.arrayBuffer()
              const contentType = (obj && obj.httpMetadata && obj.httpMetadata.contentType) ? obj.httpMetadata.contentType : 'application/octet-stream'
              const headers = new Headers({ 'Content-Type': contentType, 'Cache-Control': 'public, max-age=2592000' })
              return new Response(buf, { status: 200, headers })
            }
          } catch (e) {
            // ignore and try next
          }
        }

        return new Response('Not found', { status: 404 })
      } catch (e: any) {
        return new Response(String(e?.message || e), { status: 500 })
      }
    }

    app.get('/:year(\\d{4})/:month(\\d{2})/:day(\\d{2})/*', async (c) => {
      // Handle requests like `/2025/12/08/<key>` by treating them equivalent to `/images/<key>`
      const rawPath = c.req.path.replace(/^\/+/, '') // e.g. "2025/12/08/xxx"
      return await tryServeImageCandidates(c, rawPath)
    })

    app.get('/images/*', async (c) => {
      const rawPath = c.req.path.replace(/^\/+/, '') // e.g. "images/images/2025/..."
      return await tryServeImageCandidates(c, rawPath)
    })

// Simple FastAPI-like tester UI for the Worker
app.get('/_test', async (c) => {
  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Shirasame Worker API Tester</title>
  <style>
    :root{--bg:#f7fafc;--fg:#0f172a;--card:#ffffff;--muted:#64748b;--primary:#2b6cb0}
    body{font-family:Inter, ui-sans-serif, system-ui; background:var(--bg); color:var(--fg); margin:0; padding:24px}
    .container{max-width:980px;margin:0 auto}
    .card{background:var(--card);border-radius:12px;padding:18px;box-shadow:0 1px 2px rgba(2,6,23,0.06)}
    h1{margin:0 0 12px 0;font-size:20px}
    label{display:block;font-size:13px;margin-top:12px;color:var(--muted)}
    select,input,textarea{width:100%;padding:10px;border:1px solid #e6eef6;border-radius:8px;margin-top:6px}
    button{background:var(--primary);color:#fff;border:none;padding:10px 14px;border-radius:8px;cursor:pointer;margin-top:12px}
    pre{background:#0b1220;color:#e6eef6;padding:12px;border-radius:8px;overflow:auto}
    .flex{display:flex;gap:12px}
    .half{flex:1}
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <h1>Shirasame Worker API Tester</h1>
      <div>
        <label>Endpoint</label>
        <select id="endpoint">
          <option value="/api/images/direct-upload">POST /api/images/direct-upload</option>
          <option value="/api/images/upload">POST /api/images/upload</option>
          <option value="/api/images/complete">POST /api/images/complete</option>
          <option value="/api/admin/settings">GET /api/admin/settings</option>
          <option value="/collections">GET /collections</option>
        </select>
      </div>
      <div class="flex">
        <div class="half">
          <label>Method</label>
          <select id="method"><option>GET</option><option>POST</option><option>PUT</option><option>DELETE</option></select>
        </div>
        <div class="half">
          <label>Content-Type (optional)</label>
          <input id="contentType" placeholder="application/json or multipart/form-data" />
        </div>
      </div>
      <label>Request Body (JSON for application/json)</label>
      <textarea id="body" rows="6" placeholder='{"key":"value"}'></textarea>
      <div style="display:flex;gap:8px;margin-top:8px;align-items:center">
        <button id="send">Send</button>
        <button id="clear" style="background:#e2e8f0;color:var(--fg)">Clear</button>
        <span id="status" style="margin-left:12px;color:var(--muted)"></span>
      </div>

      <h2 style="margin-top:18px;font-size:14px;color:var(--muted)">Response</h2>
      <div style="display:flex;gap:12px">
        <div style="flex:1">
          <label>Headers</label>
          <pre id="respHeaders">{}</pre>
        </div>
        <div style="flex:2">
          <label>Body</label>
          <pre id="respBody">{}</pre>
        </div>
      </div>
    </div>
  </div>
  <script>
    const endpoint = document.getElementById('endpoint')
    const method = document.getElementById('method')
    const body = document.getElementById('body')
    const ct = document.getElementById('contentType')
    const send = document.getElementById('send')
    const clear = document.getElementById('clear')
    const status = document.getElementById('status')
    const respHeaders = document.getElementById('respHeaders')
    const respBody = document.getElementById('respBody')

    send.addEventListener('click', async () => {
      status.textContent = 'Sending...'
      respHeaders.textContent = '{}'
      respBody.textContent = '{}'
      try {
        const url = endpoint.value
        const m = method.value
        let options = { method: m, headers: {} }
        const contentType = (ct.value || '').trim()
        if (contentType) options.headers['Content-Type'] = contentType
        if (m !== 'GET' && m !== 'HEAD') {
          if (contentType.includes('application/json')) options.body = body.value
          else if (contentType.includes('multipart') ) {
            // Basic multipart via FormData: expect JSON with key->value where value starting with @file:path uses file upload (not supported in browser)
            const fd = new FormData()
            try { const obj = JSON.parse(body.value || '{}'); for (const k in obj) fd.append(k, obj[k]) } catch(e) { fd.append('raw', body.value) }
            options.body = fd
            // remove content-type to let browser set boundary
            delete options.headers['Content-Type']
          } else {
            options.body = body.value
          }
        }
        const res = await fetch(url, options)
        status.textContent = res.status + ' ' + res.statusText
        const headers = {}
        for (const [k,v] of res.headers.entries()) headers[k]=v
        respHeaders.textContent = JSON.stringify(headers, null, 2)
        const text = await res.text()
        try { respBody.textContent = JSON.stringify(JSON.parse(text), null, 2) } catch(e) { respBody.textContent = text }
      } catch (e) {
        status.textContent = 'Error'
        respBody.textContent = String(e)
      }
    })
    clear.addEventListener('click', ()=>{ body.value=''; respBody.textContent='{}'; respHeaders.textContent='{}'; status.textContent=''; })
  </script>
</body>
</html>`

  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
})

// Supplemental endpoints to satisfy admin UI requests
app.get('/recipe-pins', zValidator('query', listQuery.partial()), async (c) => {
  const supabase = getSupabase(c.env)
  try {
    const ctx = await resolveRequestUserContext(c)
    if (!ctx.trusted) {
      const base = { 'Content-Type': 'application/json; charset=utf-8' }
      const merged = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), base)
      return new Response(JSON.stringify({ error: 'unauthenticated' }), { status: 401, headers: merged })
    }
    const { data = [], error } = await supabase.from('recipe_pins').select('*').eq('user_id', ctx.userId)
    if (error) {
      const base = { 'Content-Type': 'application/json; charset=utf-8' }
      const merged = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), base)
      return new Response(JSON.stringify({ error: error.message || 'db_error' }), { status: 500, headers: merged })
    }
    const base = { 'Content-Type': 'application/json; charset=utf-8' }
    const merged = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), base)
    return new Response(JSON.stringify({ data }), { headers: merged })
  } catch (e: any) {
    const base = { 'Content-Type': 'application/json; charset=utf-8' }
    const merged = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), base)
    return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500, headers: merged })
  }
})

app.get('/custom-fonts', async (c) => {
  try {
    const base = { 'Content-Type': 'application/json; charset=utf-8' }
    const merged = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), base)
    return new Response(JSON.stringify({ data: [] }), { headers: merged })
  } catch (e: any) {
    const base = { 'Content-Type': 'application/json; charset=utf-8' }
    const merged = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), base)
    return new Response(JSON.stringify({ data: [] }), { status: 500, headers: merged })
  }
})

// Final catch-all: ensure any unmatched route returns a CORS-aware 404
// This prevents Cloudflare or upstream from returning responses without
// Access-Control-Allow-* headers which would cause browsers to block
// cross-origin requests with opaque CORS failures.
// Re-add proxy here so explicit `/api/*` handlers declared above take
// precedence. Proxy supports forwarding non-auth API calls to their
// normalized path (`/api/foo` -> `/foo`) while special-casing logout.
app.all('/api/*', async (c) => {
  try {
    const url = new URL(c.req.url)
    // Special-case logout to clear cookies for admin UI callers
    try {
      const origPath = url.pathname || ''
      if (origPath === '/api/auth/logout' && c.req.method === 'POST') {
        const headers = new Headers(Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env)))
        headers.set('Content-Type', 'application/json; charset=utf-8')
        headers.append('Set-Cookie', `sb-access-token=; Path=/; HttpOnly; SameSite=None; Max-Age=0; Secure; Domain=.shirasame.com`)
        headers.append('Set-Cookie', `sb-refresh-token=; Path=/; HttpOnly; SameSite=None; Max-Age=0; Secure; Domain=.shirasame.com`)
        return new Response(JSON.stringify({ ok: true }), { status: 200, headers })
      }
    } catch (e) {}

    // strip only the leading '/api'
    url.pathname = url.pathname.replace(/^\/api/, '') || '/'

    const method = c.req.method
    const headers = makeUpstreamHeaders(c)
    try {
      const xu = c.req.header('x-user-id') || c.req.header('X-User-Id')
      if (xu) headers['x-user-id'] = xu.toString()
    } catch {}
    try {
      const xi = c.req.header('x-internal-key') || c.req.header('X-Internal-Key')
      if (xi) headers['x-internal-key'] = xi.toString()
    } catch {}

    let body: any = undefined
    if (method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS') {
      try { body = await c.req.text() } catch { body = undefined }
    }

    // If the proxy would fetch back to the same origin, surface an error
    // to avoid request loops. This should not trigger when the worker is
    // properly mounted at the API hostname with routes handled locally.
    try {
      const reqHost = (new URL(c.req.url)).hostname
      const targetHost = url.hostname
      if (reqHost === targetHost) {
        const base = { 'Content-Type': 'application/json; charset=utf-8' }
        const merged = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), base)
        const bodyMsg = JSON.stringify({ error: 'proxy_loop_detected', message: 'Worker proxy would fetch same host; ensure admin site API routes are not shadowed. Consider mapping admin.shirasame.com/api/* to this worker or updating client API_BASE.' })
        return new Response(bodyMsg, { status: 502, headers: merged })
      }
    } catch (e) {}

    const res = await fetch(url.toString(), { method, headers, body })
    const buf = await res.arrayBuffer()
    const outHeaders: Record<string, string> = {}
    try { outHeaders['Content-Type'] = res.headers.get('content-type') || 'application/json; charset=utf-8' } catch {}
    try {
      const origin = c.req.header('Origin') || ''
      const allowed = ((c.env as any).PUBLIC_ALLOWED_ORIGINS || '').split(',').map((s: string) => s.trim()).filter(Boolean)
      let acOrigin = '*'
      if (origin) {
        if (allowed.length === 0 || allowed.indexOf('*') !== -1 || allowed.indexOf(origin) !== -1) {
          acOrigin = origin
        } else if (allowed.length > 0) {
          acOrigin = allowed[0]
        }
      } else if (allowed.length > 0) {
        acOrigin = allowed[0]
      }
      outHeaders['Access-Control-Allow-Origin'] = acOrigin
      outHeaders['Access-Control-Allow-Credentials'] = 'true'
      outHeaders['Access-Control-Allow-Headers'] = 'Content-Type, If-None-Match, Authorization, X-Internal-Key, X-User-Id'
      outHeaders['Access-Control-Allow-Methods'] = 'GET,HEAD,OPTIONS,POST,PUT,DELETE'
      outHeaders['Access-Control-Expose-Headers'] = 'ETag'
      outHeaders['Vary'] = 'Origin'
    } catch {}
    return new Response(buf, { status: res.status, headers: outHeaders })
  } catch (e: any) {
    const base = { 'Content-Type': 'application/json; charset=utf-8' }
    const merged = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), base)
    return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500, headers: merged })
  }
})

app.all('*', async (c) => {
  try {
    const headers = computeCorsHeaders(c.req.header('Origin') || null, c.env)
    headers['Content-Type'] = 'text/plain; charset=utf-8'
    return new Response('Not Found', { status: 404, headers })
  } catch (e: any) {
    const headers = computeCorsHeaders(c.req.header('Origin') || null, c.env)
    headers['Content-Type'] = 'application/json; charset=utf-8'
    return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500, headers })
  }
})

  // Export app at the end of the module
  export default app
