import { NextResponse } from "next/server"
import crypto from 'crypto'

// Run in Node runtime so we can use sharp
export const runtime = 'nodejs'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    let src = url.searchParams.get('url') || url.searchParams.get('key')
    const w = parseInt(url.searchParams.get('w') || '200', 10)
    const h = parseInt(url.searchParams.get('h') || '0', 10)

    if (!src) return NextResponse.json({ error: 'url or key is required' }, { status: 400 })

    // Normalize `src`: it may be percent-encoded or may itself point to the
    // thumbnail endpoint (e.g. caller encoded a URL that already contained
    // `/api/images/thumbnail?url=...`). Decode and iteratively unwrap any
    // nested thumbnail URLs so we reach the original source. Limit the
    // iterations to avoid infinite loops on malicious input.
    try {
      let decoded = src
      // If the incoming value is percent-encoded, try decoding a few times
      // (some callers double-encode URLs).
      for (let i = 0; i < 3; i++) {
        try {
          const maybe = decodeURIComponent(decoded)
          if (maybe === decoded) break
          decoded = maybe
        } catch (e) {
          break
        }
      }

      // Unwrap nested thumbnail endpoint URLs up to a small depth.
      for (let i = 0; i < 5; i++) {
        try {
          const lower = String(decoded).toLowerCase()
          if ((lower.startsWith('http') || lower.startsWith('https')) && lower.includes('/api/images/thumbnail')) {
            // Parse and extract its inner `url` or `key` param
            const inner = new URL(decoded)
            const innerUrl = inner.searchParams.get('url') || inner.searchParams.get('key')
            if (innerUrl) {
              // set decoded to innerUrl and attempt to decode/unpack further
              decoded = innerUrl
              // continue loop to handle multiple nesting levels
              continue
            }
          }
        } catch (e) {
          break
        }
        break
      }

      // Final decode attempt for any remaining percent-encoding
      try {
        decoded = decodeURIComponent(decoded)
      } catch (e) {}

      src = decoded
    } catch (_) {}

      // Validate host for remote URLs to avoid open-proxy behavior. Allowed hosts
      // can be configured via `ALLOWED_IMAGE_HOSTS` (comma-separated) or will
      // implicitly allow the project's configured R2 endpoint, PUBLIC_HOST,
      // NEXT_PUBLIC_R2_PUBLIC_URL host, and CDN_BASE_URL host.
      try {
        if (src.startsWith('http')) {
          const parsed = new URL(src)
          const host = parsed.hostname
          const allowedEnv = (process.env.ALLOWED_IMAGE_HOSTS || '')
          const allowedList = allowedEnv.split(',').map(s => s.trim()).filter(Boolean)
          const PUBLIC_HOST = process.env.PUBLIC_HOST || process.env.NEXT_PUBLIC_PUBLIC_HOST || ''
          const r2Account = process.env.CLOUDFLARE_ACCOUNT_ID || process.env.R2_ACCOUNT || ''
          const r2Host = r2Account ? `${r2Account}.r2.cloudflarestorage.com` : null
          // Extract additional hosts from configured public R2 URL and CDN base
          let pubR2Host: string | null = null
          let cdnHost: string | null = null
          try { const u = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || process.env.R2_PUBLIC_URL || ''; if (u) pubR2Host = new URL(u).hostname } catch {}
          try { const c = process.env.CDN_BASE_URL || process.env.NEXT_PUBLIC_CDN_BASE || ''; if (c) cdnHost = new URL(c).hostname } catch {}

          const isAllowed =
            allowedList.includes(host) ||
            (PUBLIC_HOST && host === PUBLIC_HOST) ||
            (r2Host && host === r2Host) ||
            (pubR2Host && host === pubR2Host) ||
            (cdnHost && host === cdnHost) ||
            (process.env.NODE_ENV !== 'production') // dev: be permissive to ease local testing
          if (!isAllowed) {
            console.warn('[thumbnail] rejected remote src host not in allowlist', host)
            return NextResponse.json({ error: 'source host not allowed' }, { status: 403 })
          }
        }
      } catch (e) {
        // if parsing fails, continue and let later fetch handle errors
      }

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

        // If a CDN base URL is configured, redirect to the CDN-hosted URL (fast)
        const CDN_BASE = process.env.CDN_BASE_URL || process.env.NEXT_PUBLIC_CDN_BASE || ''
        if (CDN_BASE) {
          const cdnBase = CDN_BASE.replace(/\/$/, '')
          const cdnUrl = `${cdnBase}/${r2Bucket}/${thumbKey}`
          return NextResponse.redirect(cdnUrl, 307)
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
