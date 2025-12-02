## Public API Worker (Hono)

Routes:
- `GET /products` — Public listings and product detail fetch.

Key features:
- Zod-validated query params (`id`, `slug`, `tag`, `published`, `shallow|list`, `limit`, `offset`, `count`).
- Public-mode owner scoping via `PUBLIC_PROFILE_EMAIL` (lists only).
- Shallow vs Full response shapes to minimize payloads.
- Cloudflare Cache API: 10s caching for public shallow listings.
- Cloudflare Images Transform (remote) support for listing thumbnails via `IMAGES_TRANSFORM_BASE`.

Env (set as secrets/vars):
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (secret)
- `PUBLIC_PROFILE_EMAIL`, `PUBLIC_HOST` or `NEXT_PUBLIC_PUBLIC_HOST`
- `R2_PUBLIC_URL` — Build absolute URLs from object keys (if needed)
- `IMAGES_TRANSFORM_BASE` — e.g. `https://public.example.com/cdn-cgi/image/`
- `LIST_IMAGE_WIDTH` — default `400`

Scripts:
- `pnpm --filter public-api-worker dev` to run locally (or `cd workers/public-api && pnpm dev`).
- `pnpm --filter public-api-worker deploy` to deploy via Wrangler.
