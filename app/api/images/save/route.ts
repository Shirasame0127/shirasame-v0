import { NextResponse } from "next/server"
import supabaseAdmin from "@/lib/supabase"
import { getOwnerUserId } from '@/lib/owner'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const key = body?.key
    const url = body?.url
    if (!key || !url) return NextResponse.json({ error: 'key and url are required' }, { status: 400 })

    try {
      if (supabaseAdmin) {
        let ownerUserId: string | null = null
        try {
          ownerUserId = await getOwnerUserId()
        } catch (oe) {
          console.error('[api/images/save] failed to resolve owner', oe)
          return NextResponse.json({ ok: false, error: 'owner resolution failed' }, { status: 500 })
        }

        // If the provided url is a data URL (base64), upload it to Cloudflare Images first
        let finalUrl = url
        let cfResult: any = null
        try {
          const isDataUrl = typeof url === 'string' && url.startsWith('data:')
          const cfAccount = process.env.CLOUDFLARE_ACCOUNT_ID
          const cfToken = process.env.CLOUDFLARE_IMAGES_API_TOKEN
          const r2Account = process.env.CLOUDFLARE_ACCOUNT_ID
          const r2AccessKey = process.env.R2_ACCESS_KEY_ID
          const r2Secret = process.env.R2_SECRET_ACCESS_KEY
          const r2Bucket = process.env.R2_BUCKET || 'images'

          if (isDataUrl) {
            // Prefer uploading base64 to R2 when configured
            const match = url.match(/^data:(.+);base64,(.*)$/)
            if (!match) return NextResponse.json({ ok: false, error: 'invalid data URL' }, { status: 400 })
            const mime = match[1]
            const b64 = match[2]
            const buffer = Buffer.from(b64, 'base64')
            const fileName = key || `upload-${Date.now()}`

            if (r2Account && r2AccessKey && r2Secret) {
              try {
                const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3')
                const endpoint = `https://${r2Account}.r2.cloudflarestorage.com`
                const s3 = new S3Client({ region: 'auto', endpoint, credentials: { accessKeyId: r2AccessKey, secretAccessKey: r2Secret } })
                const storagePath = `uploads/${Date.now()}-${fileName}`
                await s3.send(new PutObjectCommand({ Bucket: r2Bucket, Key: storagePath, Body: buffer, ContentType: mime }))
                finalUrl = `${endpoint}/${r2Bucket}/${storagePath}`
                cfResult = { source: 'r2', key: storagePath }
              } catch (r2e) {
                console.error('[api/images/save] R2 upload failed', r2e)
                return NextResponse.json({ ok: false, error: 'R2 upload failed', detail: String(r2e) }, { status: 502 })
              }
            } else {
              // Fall back to Cloudflare Images if R2 not configured
              if (!cfAccount || !cfToken) {
                console.error('[api/images/save] Cloudflare credentials missing but received base64 payload')
                return NextResponse.json({ ok: false, error: 'Cloudflare not configured on server' }, { status: 500 })
              }

              // Build form-data for Cloudflare (use Blob similar to other server code)
              const cfUrl = `https://api.cloudflare.com/client/v4/accounts/${cfAccount}/images/v1`
              let attempt = 0
              const maxAttempts = 3
              let cfRes: Response | null = null
              let cfJson: any = null
              while (attempt < maxAttempts) {
                try {
                  const cfForm = new FormData()
                  // @ts-ignore
                  const blob = new Blob([buffer], { type: mime })
                  cfForm.append('file', blob, fileName)

                  cfRes = await fetch(cfUrl, {
                    method: 'POST',
                    headers: {
                      Authorization: `Bearer ${cfToken}`,
                    },
                    body: cfForm as any,
                  })
                  cfJson = await cfRes.json().catch(() => null)
                  console.log(`[api/images/save] Cloudflare attempt ${attempt + 1} status:`, cfRes?.status, 'json:', cfJson)
                  if (cfRes.ok) break
                } catch (e) {
                  console.error(`[api/images/save] Cloudflare network attempt ${attempt + 1} error`, e)
                }
                attempt++
                const wait = 200 * Math.pow(2, attempt)
                await new Promise((r) => setTimeout(r, wait))
              }

              if (!cfRes || !cfRes.ok) {
                console.error('[api/images/save] Cloudflare upload failed', cfJson)
                return NextResponse.json({ ok: false, error: 'Cloudflare upload failed', detail: cfJson }, { status: 502 })
              }

              cfResult = cfJson?.result || null
              finalUrl = Array.isArray(cfResult?.variants) ? cfResult.variants[0] : cfResult?.url || finalUrl
            }
          }
        } catch (e) {
          console.error('[api/images/save] cloudflare upload exception', e)
          return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
        }

        // prepare payload and attempt insert; include cf metadata if available
        const basePayload: any = { filename: key, url: finalUrl, metadata: { key } }
        if (cfResult) basePayload.metadata = { ...basePayload.metadata, cloudflare: cfResult }
        if (ownerUserId) basePayload.user_id = ownerUserId

        let data: any = null
        try {
          const res = await supabaseAdmin.from('images').insert([basePayload]).select().maybeSingle()
          data = res.data
          if (res.error) {
            throw res.error
          }
        } catch (insertErr: any) {
          console.warn('[api/images/save] supabase insert error', insertErr)
          const msg = String(insertErr?.message || insertErr)
          // Fallback: if schema does not have user_id column, retry without it
          if (msg.includes("Could not find the 'user_id' column") || msg.includes('user_id')) {
            try {
              console.log('[api/images/save] retrying insert without user_id')
              const res2 = await supabaseAdmin.from('images').insert([{ filename: key, url: finalUrl, metadata: basePayload.metadata }]).select().maybeSingle()
              data = res2.data
              if (res2.error) {
                console.warn('[api/images/save] retry insert error', res2.error)
                return NextResponse.json({ ok: false, error: res2.error.message }, { status: 500 })
              }
            } catch (e2: any) {
              console.error('[api/images/save] retry failed', e2)
              return NextResponse.json({ ok: false, error: String(e2) }, { status: 500 })
            }
          } else {
            return NextResponse.json({ ok: false, error: msg }, { status: 500 })
          }
        }

        // Optional: append this url to owner's header images and set direct header_image for convenience
        try {
          const ownerUserId2 = ownerUserId
          if (ownerUserId2) {
            const publicUrlForUpdate = finalUrl
            // Decide if this should update profile or header automatically based on key prefix
            const keyLower = String(key || '').toLowerCase()
            const isProfile = keyLower.startsWith('avatar-') || keyLower.startsWith('profile-')

            if (isProfile) {
              const { data: upData, error: upErr } = await supabaseAdmin.from('users').update({ profile_image: publicUrlForUpdate, profile_image_key: key }).eq('id', ownerUserId2).select().maybeSingle()
              if (upErr) console.warn('[api/images/save] failed to update owner profile_image', upErr)
              else console.log('[api/images/save] updated owner profile_image result', upData)
            } else {
              const { data: userRow, error: selErr } = await supabaseAdmin.from('users').select('header_image_keys, header_image').eq('id', ownerUserId2).maybeSingle()
              if (selErr) {
                console.warn('[api/images/save] failed to fetch owner for header update', selErr)
              } else {
                const existing: any[] = userRow?.header_image_keys || []
                const newArr = [...existing, publicUrlForUpdate]
                const updatePayload: any = { header_image_keys: newArr, header_image: publicUrlForUpdate }
                const { data: upData, error: upErr } = await supabaseAdmin.from('users').update(updatePayload).eq('id', ownerUserId2).select().maybeSingle()
                if (upErr) console.warn('[api/images/save] failed to update owner header_image(s)', upErr)
                else console.log('[api/images/save] updated owner header image result', upData)
              }
            }
          }
        } catch (e) {
          console.error('[api/images/save] error updating owner header keys', e)
        }

        return NextResponse.json({ ok: true, data }, { status: 200 })
      }
    } catch (e) {
      console.error('[api/images/save] error', e)
      return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
    }

    return NextResponse.json({ ok: false, error: 'no supabase client' }, { status: 500 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}

export const runtime = 'nodejs'
