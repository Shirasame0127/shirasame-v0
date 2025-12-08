import { createRemoteJWKSet, jwtVerify } from 'jose';

// Cloudflare Worker: INTERNAL API -- JWT/JWK 検証 + owner チェックのサンプル実装
// 環境変数（Worker の Secrets / Env）:
// - JWKS_URL: Supabase の JWKS URL (例: https://<project>.supabase.co/auth/v1/.well-known/jwks.json)
// - SUPABASE_URL: Supabase URL (フォールバック検証用の /auth/v1/user)
// - INTERNAL_DB_ENDPOINT: 実際の DB / API エンドポイント (例: internal service)

const jwksCache = new Map();

async function getJwks(url: string) {
  // createRemoteJWKSet is safe to call repeatedly; we memoize by URL to avoid re-creating
  let entry = jwksCache.get(url);
  if (entry && Date.now() < entry.expire) return entry.jwks;
  const jwks = createRemoteJWKSet(new URL(url));
  // cache for 5 minutes
  jwksCache.set(url, { jwks, expire: Date.now() + 5 * 60 * 1000 });
  return jwks;
}

async function verifyJwt(token: string, jwksUrl?: string) {
  if (!jwksUrl) throw new Error('JWKS_URL not configured');
  const jwks = await getJwks(jwksUrl);
  // jwtVerify will fetch keys as needed via the remote JWKS set
  const { payload } = await jwtVerify(token, jwks, { algorithms: ['RS256'] });
  return payload;
}

async function verifyViaSupabaseUser(token: string, supabaseUrl?: string) {
  if (!supabaseUrl) throw new Error('SUPABASE_URL not configured');
  const resp = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!resp.ok) throw new Error('supabase verify failed');
  return resp.json();
}

// Extract token from Authorization header or sb-access-token cookie
function extractTokenFromRequest(req: Request) {
  const auth = req.headers.get('authorization');
  if (auth && auth.toLowerCase().startsWith('bearer ')) return auth.slice(7).trim();
  const cookie = req.headers.get('cookie');
  if (!cookie) return null;
  const match = cookie.match(/sb-access-token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

// Middleware-like helper: verifies token using JWKs, falls back to Supabase /auth/v1/user
export async function requireAuth(request: Request, env: any) {
  const token = extractTokenFromRequest(request);
  if (!token) return { status: 401, body: { error: 'missing token' } };

  // Try JWK verification first
  try {
    const payload = await verifyJwt(token, env.JWKS_URL);
    // payload.sub or payload.user_id is treated as user id
    const userId = payload.sub || payload.user_id || payload?.user?.id;
    if (!userId) throw new Error('no user id in token payload');
    return { status: 200, userId, payload };
  } catch (e) {
    // Fallback: call Supabase /auth/v1/user
    try {
      const user = await verifyViaSupabaseUser(token, env.SUPABASE_URL);
      const userId = user?.id;
      if (!userId) return { status: 401, body: { error: 'invalid token' } };
      return { status: 200, userId, payload: user };
    } catch (e2) {
      return { status: 401, body: { error: 'token verification failed' } };
    }
  }
}

// Example handler showing owner-check enforcement
export default {
  async fetch(request: Request, env: any, ctx: any) {
    const url = new URL(request.url);
    // only admin endpoints example
    if (url.pathname.startsWith('/admin/products')) {
      const auth = await requireAuth(request, env);
      if (auth.status !== 200) {
        return new Response(JSON.stringify(auth.body || { error: 'unauthenticated' }), { status: auth.status, headers: { 'content-type': 'application/json' } });
      }
      const userId = auth.userId;

      // Example: product id from query param
      const productId = url.searchParams.get('id');
      if (!productId) return new Response(JSON.stringify({ error: 'id required' }), { status: 400, headers: { 'content-type': 'application/json' } });

      // Fetch the product from internal DB/service but **force** the owner check by passing userId.
      // This ensures upstream DB returns only products owned by the verified user.
      const internalEndpoint = `${env.INTERNAL_DB_ENDPOINT}/products?id=eq.${encodeURIComponent(productId)}&user_id=eq.${encodeURIComponent(userId)}`;
      const resp = await fetch(internalEndpoint, { headers: { 'x-internal-key': env.INTERNAL_API_KEY } });
      if (!resp.ok) return new Response(JSON.stringify({ error: 'product fetch failed' }), { status: resp.status, headers: { 'content-type': 'application/json' } });
      const products = await resp.json();
      if (!products || products.length === 0) {
        // 403 or 404: treat as forbidden / not found (owner mismatch)
        return new Response(JSON.stringify({ error: 'not found or forbidden' }), { status: 403, headers: { 'content-type': 'application/json' } });
      }
      return new Response(JSON.stringify(products[0]), { status: 200, headers: { 'content-type': 'application/json' } });
    }

    // Default: 404
    return new Response('not found', { status: 404 });
  }
};
