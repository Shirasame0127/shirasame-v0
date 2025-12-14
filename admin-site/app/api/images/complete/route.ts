import { NextResponse } from 'next/server'

// Minimal proxy route to forward /api/images/complete to the configured public worker.
// This file exists so Next's build-time validator can resolve the module import.
// Runtime behavior: proxy POST bodies and essential headers to PUBLIC_WORKER_API_BASE.

const PUBLIC_WORKER = process.env.PUBLIC_WORKER_API_BASE || process.env.PUBLIC_WORKER_ORIGIN || ''

export async function POST(req: Request) {
  if (!PUBLIC_WORKER) {
    return NextResponse.json({ error: 'PUBLIC_WORKER_API_BASE not configured' }, { status: 500 })
  }

  const url = new URL('/api/images/complete', PUBLIC_WORKER).toString()

  const headers: Record<string, string> = {}
  req.headers.forEach((v, k) => {
    // Only forward essential headers
    if (k.toLowerCase() === 'content-type' || k.toLowerCase() === 'authorization' || k.toLowerCase() === 'cookie') {
      headers[k] = v
    }
  })

  const body = await req.text()

  const resp = await fetch(url, { method: 'POST', headers, body })

  const text = await resp.text()
  const resHeaders = new Headers(resp.headers)

  return new Response(text, { status: resp.status, headers: resHeaders })
}

export const runtime = 'edge'
