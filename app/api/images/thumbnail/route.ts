import { NextResponse } from "next/server"
import crypto from 'crypto'

// Run in Node runtime so we can use sharp
export const runtime = 'nodejs'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const src = url.searchParams.get('url') || url.searchParams.get('key')
    const w = parseInt(url.searchParams.get('w') || '200', 10)
    const h = parseInt(url.searchParams.get('h') || '0', 10)

    if (!src) return NextResponse.json({ error: 'url or key is required' }, { status: 400 })

    // Create a deterministic cache key
    const hash = crypto.createHash('sha256').update(`${src}|w=${w}|h=${h}`).digest('hex')
    const thumbKey = `thumbnails/${hash}-${w}x${h}.jpg`

    // Try to use R2 if configured
    const r2Account = process.env.CLOUDFLARE_ACCOUNT_ID || process.env.R2_ACCOUNT || ''
    const r2AccessKey = process.env.R2_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY || ''
    const r2Secret = process.env.R2_SECRET_ACCESS_KEY || process.env.R2_SECRET || ''
    const r2Bucket = process.env.R2_BUCKET || 'images'

    // Helper to return public R2 url
    const r2Endpoint = r2Account ? `https://${r2Account}.r2.cloudflarestorage.com` : null
    const publicThumbUrl = r2Endpoint ? `${r2Endpoint}/${r2Bucket}/${thumbKey}` : null

    if (r2Account && r2AccessKey && r2Secret) {
      try {
        const { S3Client, HeadObjectCommand, PutObjectCommand, GetObjectCommand } = await import('@aws-sdk/client-s3')
        const s3 = new S3Client({ region: 'auto', endpoint: `https://${r2Account}.r2.cloudflarestorage.com`, credentials: { accessKeyId: r2AccessKey, secretAccessKey: r2Secret } })

        // Check if thumbnail already exists
        try {
          await s3.send(new HeadObjectCommand({ Bucket: r2Bucket, Key: thumbKey }))
          // exists -> proxy the object from R2 instead of redirecting (avoids ORB/CORS issues)
          try {
            const getThumb = await s3.send(new GetObjectCommand({ Bucket: r2Bucket, Key: thumbKey }))
            const stream = (getThumb.Body as any)
            const chunks: Buffer[] = []
            for await (const chunk of stream) chunks.push(Buffer.from(chunk))
            const buf = Buffer.concat(chunks)
            return new NextResponse(buf, { status: 200, headers: { 'Content-Type': getThumb.ContentType || 'image/jpeg', 'Cache-Control': 'public, max-age=31536000, immutable', 'Access-Control-Allow-Origin': '*' } })
          } catch (e) {
            console.warn('[thumbnail] failed to proxy existing thumbnail, will regenerate', e)
          }
        } catch (_) {
          // not found -> proceed to generate
        }

        // Fetch source image (either key from R2 or absolute URL)
        let srcBuffer: Buffer | null = null
        if (src.startsWith('http')) {
          const res = await fetch(src)
          if (!res.ok) return NextResponse.json({ error: 'failed to fetch source' }, { status: 502 })
          const ab = await res.arrayBuffer()
          srcBuffer = Buffer.from(ab)
        } else {
          // assume it's a key in R2 bucket
          try {
            const getRes = await s3.send(new GetObjectCommand({ Bucket: r2Bucket, Key: src }))
            // stream into buffer
            const stream = (getRes.Body as any)
            const chunks: Buffer[] = []
            for await (const chunk of stream) chunks.push(Buffer.from(chunk))
            srcBuffer = Buffer.concat(chunks)
          } catch (e) {
            console.error('[thumbnail] failed to fetch object from R2', e)
            return NextResponse.json({ error: 'failed to fetch source from storage' }, { status: 502 })
          }
        }

        if (!srcBuffer) return NextResponse.json({ error: 'empty source' }, { status: 400 })

        const sharpModule = await import('sharp')
        const sharp = (sharpModule && (sharpModule as any).default) || sharpModule

        let pipeline = sharp(srcBuffer).rotate()
        if (w > 0 && h > 0) pipeline = pipeline.resize(w, h, { fit: 'cover' })
        else if (w > 0) pipeline = pipeline.resize({ width: w, withoutEnlargement: true })

        const outBuf = await pipeline.jpeg({ quality: 75 }).toBuffer()

        // Upload thumbnail to R2 for caching
        try {
          await s3.send(new PutObjectCommand({ Bucket: r2Bucket, Key: thumbKey, Body: outBuf, ContentType: 'image/jpeg' }))
        } catch (e) {
          console.warn('[thumbnail] failed to upload thumbnail to R2', e)
        }

        // Return the generated thumbnail directly (avoid redirect to prevent ORB/CORS blocks)
        return new NextResponse(outBuf, { status: 200, headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': 'public, max-age=31536000, immutable', 'Access-Control-Allow-Origin': '*' } })
      } catch (e) {
        console.error('[thumbnail] R2 processing failed', e)
        // fall through to on-the-fly response
      }
    }

    // Fallback: generate on-the-fly and return buffer
    try {
      let srcBuffer: Buffer | null = null
      if (src.startsWith('http')) {
        const res = await fetch(src)
        if (!res.ok) return NextResponse.json({ error: 'failed to fetch source' }, { status: 502 })
        const ab = await res.arrayBuffer()
        srcBuffer = Buffer.from(ab)
      } else {
        return NextResponse.json({ error: 'storage not configured' }, { status: 400 })
      }

      const sharpModule = await import('sharp')
      const sharp = (sharpModule && (sharpModule as any).default) || sharpModule
      let pipeline = sharp(srcBuffer).rotate()
      if (w > 0 && h > 0) pipeline = pipeline.resize(w, h, { fit: 'cover' })
      else if (w > 0) pipeline = pipeline.resize({ width: w, withoutEnlargement: true })
      const outBuf = await pipeline.jpeg({ quality: 75 }).toBuffer()

      return new NextResponse(outBuf, { status: 200, headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': 'public, max-age=31536000, immutable' } })
    } catch (e) {
      console.error('[thumbnail] fallback processing failed', e)
      return NextResponse.json({ error: 'processing failed' }, { status: 500 })
    }
  } catch (e) {
    console.error('[api/images/thumbnail] exception', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
