// Route placeholder to avoid accidental dynamic favicon handler conflicts.
// If you want a dynamic favicon, delete `public/favicon.ico` and implement
// a handler that returns the desired response. Otherwise this placeholder
// ensures the module exports a valid shape for Next's type checks.

export const runtime = 'edge'

export async function GET() {
  return new Response(null, { status: 204 })
}
// Route was intentionally removed to avoid conflict with `public/favicon.ico`.
// Keep this file present only as a placeholder to avoid accidental re-adding
// a handler that would conflict with the static `favicon.ico` in /public.

// NOTE: If you want to serve a dynamic favicon, delete the static
// `public/favicon.ico` file and implement a handler here that exports
// `GET` returning the desired response.

export const runtime = 'edge'

export async function GET() {
	return new Response(null, { status: 204 })
}
