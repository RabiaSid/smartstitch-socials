import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/server/requireUser'
import { handleApiError } from '@/lib/server/handleApiError'
import { AuthError } from '@/lib/server/requireUser'
import { platformConfig } from '@/lib/platforms'

export async function GET(req: NextRequest) {
  try {
    await requireUser(req)

    if (!platformConfig.linkedin.enabled) {
      return NextResponse.json(
        { success: false, message: platformConfig.linkedin.disabledNote, code: 'PLATFORM_DISABLED' },
        { status: 403 },
      )
    }

    const params = new URLSearchParams({
      client_id: process.env.LINKEDIN_CLIENT_ID || '',
      redirect_uri: process.env.LINKEDIN_REDIRECT_URI || '',
      scope: 'w_organization_social r_organization_social',
      response_type: 'code',
    })

    return NextResponse.redirect(`https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`)
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
