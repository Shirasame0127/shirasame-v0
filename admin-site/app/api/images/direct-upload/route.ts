import { NextResponse } from "next/server"

// CASE AではR2 + Worker経由を推奨するため、direct-uploadは
// Cloudflare Images未使用環境ではダミーを返却し、publicUrlを優先させる。
export async function POST(req: Request) {
  try {
    const workerBase = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || ''
    if (workerBase) {
      // Signal client to use Worker proxy upload and expect publicUrl
      return NextResponse.json({ ok: true, result: { uploadURL: null, id: null, publicUrlPreferred: true } }, { status: 200 })
    }
    return NextResponse.json({ error: 'direct-upload not configured (use Worker /upload-image)' }, { status: 501 })
  } catch (e) {
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}
