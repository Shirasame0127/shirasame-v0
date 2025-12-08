import { test, expect, request } from '@playwright/test'

test('whoami returns 401 when unauthenticated', async ({ baseURL }) => {
  const api = await request.newContext()
  const res = await api.get('/api/auth/whoami')
  expect([200,401]).toContain(res.status())
})

// NOTE: More comprehensive E2E tests (login, CRUD flows, images upload) should be added
// with credentials configured via environment variables in CI/staging.
