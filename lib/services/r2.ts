import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import sharp from "sharp"

type UploadResult = {
  basePath: string
  thumbKey: string
  detailKey: string
  thumbUrl?: string
  detailUrl?: string
  thumbMeta?: { width: number; height: number }
  detailMeta?: { width: number; height: number }
}

function getR2Client() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || process.env.R2_ACCOUNT || ""
  const accessKeyId = process.env.R2_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY || ""
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || process.env.R2_SECRET || ""
  if (!accountId) throw new Error("R2 account id is not configured (CLOUDFLARE_ACCOUNT_ID or R2_ACCOUNT)")
  if (!accessKeyId || !secretAccessKey) throw new Error("R2 credentials are not configured")
  const endpoint = `https://${accountId}.r2.cloudflarestorage.com`
  return new S3Client({
    region: "auto",
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
  })
}

function getBucket() {
  const bucket = process.env.R2_BUCKET || process.env.R2_BUCKET_NAME || "images"
  return bucket
}

function toPublicUrl(key: string) {
  const pubRoot = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL || process.env.R2_PUBLIC_URL || "").replace(/\/$/, "")
  return pubRoot ? `${pubRoot}/${key.replace(/^\/+/, "")}` : undefined
}

export async function uploadImageVariantsToR2(sourceUrl: string, basePath: string): Promise<UploadResult> {
  const s3 = getR2Client()
  const bucket = getBucket()

  const res = await fetch(sourceUrl)
  if (!res.ok) throw new Error(`Failed to fetch source image: ${res.status}`)
  const arrayBuf = await res.arrayBuffer()
  const input = Buffer.from(arrayBuf)

  // Prepare Sharp pipeline with sensible defaults
  const common = sharp(input, { failOn: "none" })

  // Build both variants in parallel
  const thumbPipelineJpg = common.clone().resize({ width: 400, withoutEnlargement: true, fit: "inside" }).jpeg({ quality: 82, progressive: true, mozjpeg: true })
  const detailPipelineJpg = common.clone().resize({ width: 800, withoutEnlargement: true, fit: "inside" }).jpeg({ quality: 86, progressive: true, mozjpeg: true })
  const thumbPipelineWebp = common.clone().resize({ width: 400, withoutEnlargement: true, fit: "inside" }).webp({ quality: 80 })
  const detailPipelineWebp = common.clone().resize({ width: 800, withoutEnlargement: true, fit: "inside" }).webp({ quality: 84 })

  const [thumbBuffer, detailBuffer, thumbWebp, detailWebp] = await Promise.all([
    thumbPipelineJpg.toBuffer(),
    detailPipelineJpg.toBuffer(),
    thumbPipelineWebp.toBuffer().catch(() => Buffer.from([])),
    detailPipelineWebp.toBuffer().catch(() => Buffer.from([])),
  ])

  const thumbMetaRaw = await sharp(thumbBuffer).metadata()
  const thumbMeta = { width: thumbMetaRaw.width || 0, height: thumbMetaRaw.height || 0 }
  const detailMetaRaw = await sharp(detailBuffer).metadata()
  const detailMeta = { width: detailMetaRaw.width || 0, height: detailMetaRaw.height || 0 }

  // Keys
  const base = basePath.replace(/\/$/, "")
  const thumbKey = `${base}/thumb-400.jpg`
  const detailKey = `${base}/detail-800.jpg`

  // Upload to R2 with simple retry
  const put = async (key: string, body: Buffer, contentType: string) => {
    if (!body || body.length === 0) return
    const cmd = new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType, CacheControl: "public, max-age=31536000, immutable" })
    let attempt = 0
    let lastErr: any = null
    while (attempt < 3) {
      try { await s3.send(cmd); return } catch (e) { lastErr = e; attempt++; await new Promise(r => setTimeout(r, 150 * (attempt + 1))) }
    }
    throw lastErr
  }
  await Promise.all([
    put(thumbKey, thumbBuffer, "image/jpeg"),
    put(detailKey, detailBuffer, "image/jpeg"),
    put(thumbKey.replace(/\.jpg$/i, ".webp"), thumbWebp, "image/webp"),
    put(detailKey.replace(/\.jpg$/i, ".webp"), detailWebp, "image/webp"),
  ])

  return {
    basePath: base,
    thumbKey,
    detailKey,
    thumbUrl: toPublicUrl(thumbKey),
    detailUrl: toPublicUrl(detailKey),
    thumbMeta,
    detailMeta,
  }
}

export function deriveBasePathFromUrl(url?: string | null): string | null {
  if (!url) return null
  try {
    const u = new URL(url)
    const path = u.pathname.replace(/^\/+/, "")
    const withoutBucket = path.replace(new RegExp(`^${(process.env.R2_BUCKET || "images").replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/`), "")
    return withoutBucket.replace(/\/(thumb-400|detail-800)\.(jpg|jpeg|png|webp)$/i, "")
  } catch {
    return url.replace(/\/(thumb-400|detail-800)\.(jpg|jpeg|png|webp)$/i, "")
  }
}
