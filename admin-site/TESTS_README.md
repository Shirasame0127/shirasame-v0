Playwright E2E (staging)

This project includes a minimal Playwright setup to run basic checks against a staging or local environment.

Setup:
- Install dependencies in `admin-site`:
  - `pnpm install -w` from repo root or `cd admin-site && pnpm install`
- Run tests against staging by setting `STAGING_BASE_URL`:
  - `STAGING_BASE_URL=https://staging.example.com pnpm exec playwright test`

Notes:
- Extend `tests/` with full flows: login, dashboard, product CRUD, collection CRUD, tags, recipes, settings, image upload+complete.
- Configure credentials securely in CI (GitHub Actions secrets) and use fixtures to perform auth steps.
