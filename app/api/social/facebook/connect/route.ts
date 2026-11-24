import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/server/requireUser'
import { handleApiError } from '@/lib/server/handleApiError'
import { AuthError } from '@/lib/server/requireUser'
import { GRAPH_VERSION, META_SCOPES, META_STATE_COOKIE as STATE_COOKIE } from '@/lib/server/services/metaService'

// One Meta login connects both the Facebook Page and the Instagram Business
// account linked to it.
export async function GET(req: NextRequest) {
  try {
    await requireUser(req)

    const state = crypto.randomBytes(16).toString('hex')
    // "Facebook Login for Business" apps use a configuration ID (set up in the
    // app dashboard with the permissions) instead of a scope list.
    const configId = process.env.FACEBOOK_LOGIN_CONFIG_ID
    const params = new URLSearchParams({
      client_id: process.env.FACEBOOK_APP_ID || '',
      redirect_uri: process.env.FACEBOOK_REDIRECT_URI || '',
      response_type: 'code',
      state,
      ...(configId ? { config_id: configId } : { scope: META_SCOPES }),
    })

    const res = NextResponse.redirect(`https://www.facebook.com/${GRAPH_VERSION}/dialog/oauth?${params.toString()}`)
    res.cookies.set(STATE_COOKIE, state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600,
      path: '/',
    })
    return res
  } catch (err) {
    // Opened by a browser navigation, so send signed-out users to login.
    if (err instanceof AuthError) {
      // Session missing or invalid: clear the stale cookie and sign in again.
      const res = NextResponse.redirect(new URL('/login?next=/accounts', req.url))
      res.cookies.delete(process.env.JWT_COOKIE_NAME || 'ss_token')
      return res
    }
    return handleApiError(err)
  }
}
