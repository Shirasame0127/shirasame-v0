import { test, expect } from '@playwright/test'

// To run these tests you must set environment variables:
// ADMIN_TEST_TOKEN and ADMIN_REFRESH_TOKEN containing a valid Supabase session tokens.

test('whoami and admin products with cookie auth', async ({ page, request }) => {
  const token = process.env.ADMIN_TEST_TOKEN
  const refresh = process.env.ADMIN_REFRESH_TOKEN || ''
  test.skip(!token, 'ADMIN_TEST_TOKEN not set')

  // Set cookie in browser context
  await page.context().addCookies([{
    name: 'sb-access-token', value: token, domain: 'admin.shirasame.com', path: '/', httpOnly: true, secure: true
  }, {
    name: 'sb-refresh-token', value: refresh, domain: 'admin.shirasame.com', path: '/', httpOnly: true, secure: true
  }])

  // whoami
  const who = await page.request.get('https://admin.shirasame.com/api/auth/whoami', { headers: { Origin: 'https://admin.shirasame.com' } })
  expect(who.status()).toBe(200)
  const whoJson = await who.json()
  expect(whoJson.ok).toBeTruthy()
  const uid = whoJson.user?.id
  expect(uid).toBeTruthy()

  // admin products
  const prod = await page.request.get('https://admin.shirasame.com/api/admin/products', { headers: { Origin: 'https://admin.shirasame.com' } })
  expect([200,401]).toContain(prod.status())
  if (prod.status() === 200) {
    const pj = await prod.json()
    expect(pj).toHaveProperty('data')
  }
})
