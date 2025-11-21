import { NextResponse } from "next/server"
import supabaseAdmin from "@/lib/supabase"

export const runtime = "edge"

export async function POST(req: Request) {
  try {
    const cfAccount = process.env.CLOUDFLARE_ACCOUNT_ID
    const cfToken = process.env.CLOUDFLARE_IMAGES_API_TOKEN

    if (!cfAccount || !cfToken) {
      return NextResponse.json({ error: "Cloudflare Images credentials not configured" }, { status: 500 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File | null
    if (!file) return NextResponse.json({ error: "file is required" }, { status: 400 })

    // forward file to Cloudflare Images
    const url = `https://api.cloudflare.com/client/v4/accounts/${cfAccount}/images/v1`

    const cfForm = new FormData()
    cfForm.append("file", file as Blob)

    const cfRes = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cfToken}`,
      },
      body: cfForm as any,
    })

    const cfJson = await cfRes.json()

    if (!cfRes.ok) {
      return NextResponse.json({ error: "Cloudflare upload failed", detail: cfJson }, { status: 502 })
    }

    const result = cfJson.result

    // Persist metadata to Supabase if available
    let inserted: any = null
    try {
      if (supabaseAdmin) {
        const { data, error } = await supabaseAdmin.from("images").insert([
          {
            cf_id: result?.id,
            url: Array.isArray(result?.variants) ? result.variants[0] : result?.url || null,
            filename: result?.filename || null,
            metadata: result || {},
          },
        ]).select().single()

        if (!error) inserted = data
      }
    } catch (e) {
      // ignore Supabase errors here, return CF result anyway
      console.error("supabase insert failed", e)
    }

    return NextResponse.json({ result, inserted })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "internal" }, { status: 500 })
  }
}
