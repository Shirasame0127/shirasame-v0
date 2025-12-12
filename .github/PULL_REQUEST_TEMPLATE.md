Purpose
-------
- Unify admin-site API calls to go through `public-worker` and prefer cookie-based auth.
- Use Supabase `SERVICE_ROLE` key in `public-worker` for DB operations and enforce user_id-based access.

Summary of changes
------------------
- admin-site: update `apiFetch` to prefer cookie auth (do not auto-attach Authorization).
- public-worker: use `SUPABASE_SERVICE_ROLE_KEY` when available.
- migrations: add SQL to create unique constraints and dedupe scripts.
- CI: add `scripts/check_admin_fetch.js` to detect raw `fetch('/api'` usage.

Deployment
----------
1. Create branch and push.
2. Run CI (includes `scripts/check_admin_fetch.js`).
3. Build & deploy admin-site.
4. Publish worker: `npx wrangler publish --env production --config public-worker/wrangler.toml`.
5. Smoke tests: cookie-based `/api/auth/whoami` and `/api/admin/products`.

Rollback
--------
- Revert commits and re-deploy worker. Backup DB before applying migrations.
