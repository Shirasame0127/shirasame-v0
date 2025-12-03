// Simple test to reproduce presigner publicUrl logic from direct-upload/route.ts
const account = process.env.CLOUDFLARE_ACCOUNT_ID || 'demo-account'
const bucket = process.env.R2_BUCKET || 'images'
const filename = process.argv[2] || `upload-12345.jpg`
const key = `uploads/${filename}`
const endpoint = `https://${account}.r2.cloudflarestorage.com`
const publicUrl = `${endpoint}/${bucket}/${key.split('/').map(encodeURIComponent).join('/')}`
console.log('account:', account)
console.log('bucket:', bucket)
console.log('key:', key)
console.log('computed publicUrl:', publicUrl)
