import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"

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
  // Fallback implementation: do NOT perform server-side image transforms.
  // Instead, fetch the original image and upload it to R2 as the canonical asset.
  // Consumers should use Cloudflare Image Resizing at delivery time to request variants.
  const s3 = getR2Client()
  const bucket = getBucket()

  const res = await fetch(sourceUrl)
  if (!res.ok) throw new Error(`Failed to fetch source image: ${res.status}`)
  const arrayBuf = await res.arrayBuffer()
  const input = Buffer.from(arrayBuf)

  // Determine extension from Content-Type or URL path
  const ct = (res.headers.get("content-type") || "").toLowerCase()
  const urlObj = (() => { try { return new URL(sourceUrl) } catch { return null } })()
  const extFromPath = urlObj ? (urlObj.pathname.split('.').pop() || '') : ''
  let ext = ".jpg"
  if (ct.includes("png")) ext = ".png"
  else if (ct.includes("webp")) ext = ".webp"
  else if (ct.includes("gif")) ext = ".gif"
  else if (ct.includes("jpeg") || ct.includes("jpg")) ext = ".jpg"
  else if (extFromPath && /^(jpg|jpeg|png|gif|webp)$/i.test(extFromPath)) ext = `.${extFromPath}`

  const base = basePath.replace(/\/$/, "")
  const originalKey = `${base}/original${ext}`

  const putCmd = new PutObjectCommand({ Bucket: bucket, Key: originalKey, Body: input, ContentType: ct || "application/octet-stream", CacheControl: "public, max-age=31536000, immutable" })
  let attempt = 0
  let lastErr: any = null
  while (attempt < 3) {
    try { await s3.send(putCmd); break } catch (e) { lastErr = e; attempt++; await new Promise(r => setTimeout(r, 150 * (attempt + 1))) }
  }
  if (lastErr) throw lastErr

  return {
    basePath: base,
    thumbKey: originalKey,
    detailKey: originalKey,
    thumbUrl: toPublicUrl(originalKey),
    detailUrl: toPublicUrl(originalKey),
    thumbMeta: undefined,
    detailMeta: undefined,
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
