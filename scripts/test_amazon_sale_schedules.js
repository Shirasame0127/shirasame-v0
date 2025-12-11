// Usage: node scripts/test_amazon_sale_schedules.js
// Expects Node 18+ (global fetch). Customize COOKIE and X_USER_ID below.
const COOKIE = process.env.TEST_COOKIE || "cf_clearance=PLACEHOLDER; sb-access-token=PLACEHOLDER; sb-refresh-token=PLACEHOLDER";
const X_USER_ID = process.env.TEST_X_USER_ID || "7b9743e9-fb19-4fb7-9512-c6c24e1d5ef4";
const ORIGIN = process.env.TEST_ORIGIN || 'https://admin.shirasame.com';
const HOST = process.env.TEST_HOST || 'https://admin.shirasame.com';

const endpoints = [
  '/api/amazon-sale-schedules',
  '/api/admin/amazon-sale-schedules',
  '/amazon-sale-schedules',
]

async function run(){
  for (const p of endpoints){
    const url = `${HOST}${p}`
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Cookie': COOKIE,
          'Origin': ORIGIN,
          'x-user-id': X_USER_ID,
          'Accept': 'application/json'
        },
      })
      const text = await res.text()
      let body = text
      try { body = JSON.parse(text) } catch {}
      console.log(`[${p}] ${res.status} ${res.statusText}`)
      console.log('body:', body)
    } catch (e){
      console.error(`[${p}] fetch error:`, String(e))
    }
  }
}

run()
  .catch(e=>{ console.error(e); process.exit(1) })
