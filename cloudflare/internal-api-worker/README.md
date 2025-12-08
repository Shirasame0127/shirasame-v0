Internal API Worker (Hardened)

This sample Cloudflare Worker demonstrates a hardened upstream implementation that:

- Verifies JWTs using JWKS (JWK remote set) as the primary verification method.
- Falls back to Supabase `/auth/v1/user` when necessary.
- Accepts tokens from `Authorization: Bearer <token>` or `sb-access-token` cookie.
- Extracts `user_id` and enforces owner checks on data access by adding `user_id` constraints.

Set the following environment variables in your Worker deployment:

- `JWKS_URL` — JWKS endpoint for your auth provider (e.g. Supabase JWKS URL).
- `SUPABASE_URL` — Supabase base URL (used for fallback verification).
- `INTERNAL_DB_ENDPOINT` — internal DB/service endpoint that the worker queries (must accept `user_id` filters).
- `INTERNAL_API_KEY` — internal API key for service-to-service auth.

Build / Deploy

This worker depends on `jose`. Use your usual bundler (esbuild/webpack) or Wrangler to bundle and deploy.
