# admin-api-proxy

This Cloudflare Worker proxies requests from `https://admin.shirasame.com/api/*` to the public worker origin (default `https://public-worker.shirasame-official.workers.dev`). Use this to keep the admin pages served from `admin-site` while forwarding all API calls to the public worker.

Deployment (quick):

1. Install Wrangler: `npm install -g wrangler` or use the Cloudflare UI.
2. Login: `wrangler login` and follow the prompts.
3. Set `API_BASE_ORIGIN` either in `wrangler.toml` under `vars` or in the Cloudflare dashboard (recommended for secrets).
4. Publish:

```powershell
cd cloudflare/admin-api-proxy
wrangler publish
```

Routes:
- Configure a route in Cloudflare dashboard or via `wrangler` routes: `admin.shirasame.com/api/*` so that this Worker runs for API paths on the admin domain.

Notes:
- This worker is only a transparent proxy; it does not implement new API logic. The real API code remains in `public-worker.shirasame-official.workers.dev`.
- Ensure cookies are preserved (same-origin) so Supabase session works as before.
