import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Protect all /admin routes server-side. If the request contains a valid
// sb-access-token cookie and the token resolves to a user via the internal
// /api/auth/whoami route, allow the request to proceed. Otherwise redirect
// to /admin/login.

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Only guard admin routes
  if (!pathname.startsWith('/admin')) return NextResponse.next()

  // Allow the login page and static/_next assets without auth
  if (pathname === '/admin/login' || pathname.startsWith('/admin/_next') || pathname.startsWith('/_next')) {
    return NextResponse.next()
  }

  // Forward cookies to our internal whoami endpoint to validate token.
  try {
    const origin = req.nextUrl.origin
    const res = await fetch(`${origin}/api/auth/whoami`, {
      method: 'GET',
      headers: {
        cookie: req.headers.get('cookie') || ''
      },
      // keep same credentials behaviour
      redirect: 'manual'
    })

    if (!res.ok) {
      const login = new URL('/admin/login', origin)
      login.searchParams.set('r', pathname)
      return NextResponse.redirect(login)
    }

    const json = await res.json().catch(() => null)
    if (!json || !json.ok || !json.user || !json.user.id) {
      const login = new URL('/admin/login', origin)
      login.searchParams.set('r', pathname)
      return NextResponse.redirect(login)
    }

    // Authenticated — proceed
    return NextResponse.next()
  } catch (e) {
    const login = new URL('/admin/login', req.nextUrl.origin)
    login.searchParams.set('r', pathname)
    return NextResponse.redirect(login)
  }
}

export const config = {
  matcher: ['/admin/:path*']
}
