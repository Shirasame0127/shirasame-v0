export async function sha256Hex(input: ArrayBuffer | string): Promise<string> {
  const enc = typeof input === 'string' ? new TextEncoder().encode(input) : new Uint8Array(input)
  const digest = await crypto.subtle.digest('SHA-256', enc)
  const bytes = Array.from(new Uint8Array(digest))
  return bytes.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function makeWeakEtag(body: string | ArrayBuffer): Promise<string> {
  const hex = await sha256Hex(body)
  return `W/"${hex}"`
}
