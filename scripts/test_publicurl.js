// Simple test to reproduce presigner publicUrl logic from direct-upload/route.ts
const account = process.env.CLOUDFLARE_ACCOUNT_ID || 'demo-account'
const bucket = process.env.R2_BUCKET || 'images'
const filename = process.argv[2] || `upload-12345.jpg`
const key = `uploads/${filename}`
const hostBase = process.env.R2_HOST || ''
if (!hostBase) throw new Error('R2_HOST env required for test_publicurl')
const endpoint = `https://${account}.${hostBase}`
const publicUrl = `${endpoint}/${bucket}/${key.split('/').map(encodeURIComponent).join('/')}`
console.log('account:', account)
console.log('bucket:', bucket)
console.log('key:', key)
console.log('computed publicUrl:', publicUrl)
