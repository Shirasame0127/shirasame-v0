import { NextResponse } from "next/server"
import supabaseAdmin from "@/lib/supabase"
import { getOwnerUserId } from '@/lib/owner'

// export const runtime = "edge" // Switch to Node.js runtime for better stability with FormData

export async function POST(req: Request) {
  try {
    console.log('[api/images/upload] request received')
    try {
      const ua = req.headers.get('user-agent')
      console.log('[api/images/upload] headers user-agent:', ua)
    } catch (hErr) {
      console.warn('[api/images/upload] failed to read headers', hErr)
    }
    const cfAccount = process.env.CLOUDFLARE_ACCOUNT_ID
    const cfToken = process.env.CLOUDFLARE_IMAGES_API_TOKEN
    const r2Account = process.env.CLOUDFLARE_ACCOUNT_ID
    const r2AccessKey = process.env.R2_ACCESS_KEY_ID
    const r2Secret = process.env.R2_SECRET_ACCESS_KEY
    const r2Bucket = process.env.R2_BUCKET || 'images'

    const formData = await req.formData()
    const file = formData.get("file") as File | null
    if (!file) return NextResponse.json({ error: "file is required" }, { status: 400 })

    const arrayBuffer = await file.arrayBuffer()
    const fileName = (file as File).name || `upload-${Date.now()}`

    // Prefer Cloudflare R2 (S3-compatible) if credentials provided
    if (r2Account && r2AccessKey && r2Secret) {
      try {
        const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3')
        const endpoint = `https://${r2Account}.r2.cloudflarestorage.com`
        const s3 = new S3Client({ region: 'auto', endpoint, credentials: { accessKeyId: r2AccessKey, secretAccessKey: r2Secret } })
        const storagePath = `uploads/${Date.now()}-${fileName}`
        const body = Buffer.from(arrayBuffer)

        await s3.send(new PutObjectCommand({ Bucket: r2Bucket, Key: storagePath, Body: body, ContentType: (file as File).type || 'application/octet-stream' }))
        const publicUrl = `${endpoint}/${r2Bucket}/${storagePath}`

        // persist metadata to images table
        try {
          const ownerUserId2 = await getOwnerUserId().catch(() => null)
          const insertObj: any = { filename: fileName, url: publicUrl, metadata: { source: 'r2', key: storagePath }, user_id: ownerUserId2 }
          const { data, error } = await supabaseAdmin.from('images').insert([insertObj]).select().maybeSingle()
          console.log('[api/images/upload] supabase insert after r2 upload', { data, error })
        } catch (e) {
          console.error('[api/images/upload] failed to insert image metadata after r2 upload', e)
        }

        // update users record
        try {
          const ownerUserId2 = await getOwnerUserId().catch(() => null)
          if (ownerUserId2 && publicUrl) {
            const target = formData.get('target')?.toString() || 'header'
                if (target === 'profile') {
                  await supabaseAdmin.from('users').update({ profile_image: publicUrl, profile_image_key: storagePath }).eq('id', ownerUserId2)
                } else if (target === 'header') {
                  const { data: userRow } = await supabaseAdmin.from('users').select('header_image_keys').eq('id', ownerUserId2).maybeSingle()
                  const existing: any[] = userRow?.header_image_keys || []
                  const newArr = [...existing, publicUrl]
                  await supabaseAdmin.from('users').update({ header_image_keys: newArr, header_image: publicUrl }).eq('id', ownerUserId2)
                } else {
                  // For non-profile/header uploads (product, attachment, background, etc.), do not modify user record here.
                }
          }
        } catch (e) {
          console.warn('[api/images/upload] failed to update users after r2 upload', e)
        }

        return NextResponse.json({ ok: true, result: { url: publicUrl, key: storagePath, bucket: r2Bucket } }, { status: 200 })
      } catch (r2e) {
        console.error('[api/images/upload] R2 upload failed', r2e)
      }
    }

    // If R2 not configured or R2 upload failed, fall back to Cloudflare Images (legacy) if configured
    if (cfAccount && cfToken) {
      const url = `https://api.cloudflare.com/client/v4/accounts/${cfAccount}/images/v1`
      // Attempt with simple retry/backoff for transient errors
      let cfRes: Response | null = null
      let cfJson: any = null
      let attempt = 0
      const maxAttempts = 3
      while (attempt < maxAttempts) {
        try {
          const cfForm = new FormData()
          const fileBlob = new Blob([arrayBuffer], { type: (file as File).type || "application/octet-stream" })
          cfForm.append("file", fileBlob, fileName)

          cfRes = await fetch(url, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${cfToken}`,
            },
            body: cfForm as any,
          })
          cfJson = await cfRes.json().catch(() => null)
          console.log(`[api/images/upload] Cloudflare attempt ${attempt + 1} status:`, cfRes?.status, 'json:', cfJson)
          if (cfRes.ok) break
          // otherwise treat as error and retry
          console.warn(`[api/images/upload] Cloudflare error attempt ${attempt + 1}:`, cfJson)
        } catch (e) {
          console.error(`[Upload Attempt ${attempt + 1}] Network error:`, e)
          cfJson = { error: String(e) }
        }
        attempt++
        const wait = 200 * Math.pow(2, attempt)
        await new Promise((r) => setTimeout(r, wait))
      }

      if (cfRes && cfRes.ok) {
        const result = cfJson?.result
        // Persist metadata to Supabase if available
        let inserted: any = null
        let ownerUserId: string | null = null
        try {
          if (supabaseAdmin) {
            try {
              ownerUserId = await getOwnerUserId()
            } catch (oe) {
              console.error('[api/images/upload] failed to resolve owner', oe)
            }
            const insertObj: any = {
              cf_id: result?.id,
              url: Array.isArray(result?.variants) ? result.variants[0] : result?.url || null,
              filename: result?.filename || fileName,
              metadata: result || {},
              user_id: ownerUserId,
            }
            console.log('[api/images/upload] inserting image metadata', insertObj)
            const { data, error } = await supabaseAdmin.from('images').insert([insertObj]).select().single()
            console.log('[api/images/upload] supabase insert result', { data, error })
            if (!error) inserted = data
          }
        } catch (e) {
          console.error("supabase insert failed", e)
        }

        // Attempt to update users record depending on 'target' form field (profile vs header)
        try {
          if (supabaseAdmin) {
            const target = formData.get('target')?.toString() || 'header'
            const publicUrl = Array.isArray(result?.variants) ? result.variants[0] : result?.url || null
            if (ownerUserId && publicUrl) {
              if (target === 'profile') {
                const { data: upData, error: upErr } = await supabaseAdmin.from('users').update({ profile_image: publicUrl, profile_image_key: (result?.filename || publicUrl) }).eq('id', ownerUserId).select().maybeSingle()
                console.log('[api/images/upload] updated user profile image result', { upData, upErr })
              } else if (target === 'header') {
                const { data: userRow, error: selErr } = await supabaseAdmin.from('users').select('header_image_keys, header_image').eq('id', ownerUserId).maybeSingle()
                if (selErr) {
                  console.warn('[api/images/upload] failed to fetch owner for header update', selErr)
                } else {
                  const existing: any[] = userRow?.header_image_keys || []
                  const newArr = [...existing, publicUrl]
                  const updatePayload: any = { header_image_keys: newArr, header_image: publicUrl }
                  const { data: upData, error: upErr } = await supabaseAdmin.from('users').update(updatePayload).eq('id', ownerUserId).select().maybeSingle()
                  console.log('[api/images/upload] updated user header image result', { upData, upErr })
                }
              } else {
                // Do not touch user record for other upload targets
              }
            }
          }
        } catch (ue) {
          console.warn('[api/images/upload] failed to update users after cf upload', ue)
        }

        // Success
        return NextResponse.json({ ok: true, result: cfJson?.result, inserted }, { status: 200 })
      }

      // If we reach here, Cloudflare attempted but did not return ok
      console.warn('[api/images/upload] Cloudflare upload failed; attempting Supabase Storage fallback')

      try {
        const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'images'
        const storagePath = `uploads/${Date.now()}-${fileName}`
        const fileBlob = new Blob([arrayBuffer], { type: (file as File).type || 'application/octet-stream' })

        if (supabaseAdmin && typeof (supabaseAdmin as any).storage !== 'undefined') {
          const storage = (supabaseAdmin as any).storage
          // Try upload
          const { data: uploadData, error: uploadError } = await storage.from(bucket).upload(storagePath, fileBlob as any, { contentType: fileBlob.type })
          if (uploadError) {
            console.error('[api/images/upload] supabase storage upload error', uploadError)
          } else {
            // get public url
            const { data: publicData } = await storage.from(bucket).getPublicUrl(storagePath)
            const publicUrl = publicData?.publicUrl || null

            // persist metadata to images table
            try {
              const ownerUserId2 = await getOwnerUserId().catch(() => null)
              const insertObj: any = { filename: fileName, url: publicUrl, metadata: { source: 'supabase-storage' }, user_id: ownerUserId2 }
              const { data, error } = await supabaseAdmin.from('images').insert([insertObj]).select().maybeSingle()
              console.log('[api/images/upload] supabase insert after storage upload', { data, error })
            } catch (e) {
              console.error('[api/images/upload] failed to insert image metadata after storage upload', e)
            }

            // update user header/profile similar to CF path
            try {
              const ownerUserId2 = await getOwnerUserId().catch(() => null)
              if (ownerUserId2 && publicUrl) {
                const target = formData.get('target')?.toString() || 'header'
                if (target === 'profile') {
                  await supabaseAdmin.from('users').update({ profile_image: publicUrl, profile_image_key: fileName }).eq('id', ownerUserId2)
                } else if (target === 'header') {
                  const { data: userRow } = await supabaseAdmin.from('users').select('header_image_keys').eq('id', ownerUserId2).maybeSingle()
                  const existing: any[] = userRow?.header_image_keys || []
                  const newArr = [...existing, publicUrl]
                  await supabaseAdmin.from('users').update({ header_image_keys: newArr, header_image: publicUrl }).eq('id', ownerUserId2)
                } else {
                  // skip updating user record for other types
                }
              }
            } catch (e) {
              console.warn('[api/images/upload] failed to update users after supabase storage upload', e)
            }

            return NextResponse.json({ ok: true, result: { url: publicUrl, storage: 'supabase' } }, { status: 200 })
          }
        }
      } catch (e) {
        console.error('[api/images/upload] supabase storage fallback exception', e)
      }

      console.warn('[api/images/upload] Cloudflare upload failed and supabase fallback also failed')
      return NextResponse.json({ error: 'Cloudflare upload failed; fallback failed', detail: cfJson }, { status: 502 })
    }

    // If we reach here, Cloudflare credentials are not configured
    console.error('[api/images/upload] Cloudflare credentials not configured')
    return NextResponse.json({ error: 'Cloudflare is not configured on server' }, { status: 500 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "internal" }, { status: 500 })
  }
}
