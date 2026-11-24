import { NextResponse, type NextRequest } from 'next/server'

// Next.js 16 "proxy" (formerly middleware). Sends signed-out visitors to
// /login before any dashboard page renders. It only checks that the session
// cookie exists; the API routes still verify the JWT on every request.
const COOKIE_NAME = process.env.JWT_COOKIE_NAME || 'ss_token'

export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl
  const hasSession = Boolean(req.cookies.get(COOKIE_NAME)?.value)

  // Always let /login render: the cookie may exist but be expired or signed
  // with an old JWT_SECRET, and bouncing to /dashboard would loop.
  if (pathname === '/login') return NextResponse.next()

  if (!hasSession) {
    const url = new URL('/login', req.url)
    url.searchParams.set('next', pathname + search)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  // Everything except API routes, Next internals and static files.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images|media|avatars|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)'],
}
