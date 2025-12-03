import { NextResponse } from "next/server"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

// Returns a presigned PUT URL for Cloudflare R2 (S3-compatible) so the browser can upload directly.
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const account = process.env.CLOUDFLARE_ACCOUNT_ID
    const accessKey = process.env.R2_ACCESS_KEY_ID
    const secret = process.env.R2_SECRET_ACCESS_KEY
    const bucket = process.env.R2_BUCKET || 'images'

    if (!account || !accessKey || !secret) {
      return NextResponse.json({ error: 'R2 credentials not configured (R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY / CLOUDFLARE_ACCOUNT_ID)' }, { status: 500 })
    }

    const fileName = body?.filename || `upload-${Date.now()}-${Math.random().toString(36).slice(2,8)}`
    const contentType = body?.contentType || 'application/octet-stream'
    const key = `uploads/${fileName}`
    const endpoint = `https://${account}.r2.cloudflarestorage.com`

    const s3 = new S3Client({
      region: 'auto',
      endpoint,
      credentials: { accessKeyId: accessKey, secretAccessKey: secret },
    })

    const command = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType })
    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 60 * 60 })

    // Construct a public URL for convenience so clients can show previews immediately.
    // Encode each path segment separately so that '/' separators remain intact in the URL.
    const publicUrl = `${endpoint}/${bucket}/${key.split('/').map(encodeURIComponent).join('/')}`

    // Return a payload compatible with the existing client which expects result.uploadURL and result.id
    return NextResponse.json({ result: { uploadURL: signedUrl, id: key, bucket, publicUrl } })
  } catch (err) {
    console.error('[api/images/direct-upload] error', err)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}
