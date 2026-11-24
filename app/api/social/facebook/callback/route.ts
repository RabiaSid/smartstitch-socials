import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/server/db'
import { SocialAccount } from '@/lib/server/models/SocialAccount'
import { requireUser } from '@/lib/server/requireUser'
import { encryptToken } from '@/lib/server/crypto'
import {
  exchangeCodeForLongLivedUserToken,
  getManagedPages,
  META_STATE_COOKIE as STATE_COOKIE,
} from '@/lib/server/services/metaService'
import { syncAccount } from '@/lib/server/services/accountSync'

function back(path: string) {
  const res = NextResponse.redirect(`${process.env.CLIENT_URL || ''}${path}`)
  res.cookies.delete(STATE_COOKIE)
  return res
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  if (searchParams.get('error')) return back('/accounts?error=meta_denied')
  if (!code) return back('/accounts?error=meta_missing_code')
  if (!state || state !== req.cookies.get(STATE_COOKIE)?.value) {
    return back('/accounts?error=meta_bad_state')
  }

  try {
    const user = await requireUser(req)
    await connectDB()

    const userToken = await exchangeCodeForLongLivedUserToken(code)
    const pages = await getManagedPages(userToken)
    if (pages.length === 0) return back('/accounts?error=meta_no_pages')

    // Pick the SmartStitch page: FACEBOOK_PAGE_ID if set, otherwise the first page.
    const wantedId = process.env.FACEBOOK_PAGE_ID
    const page = (wantedId && pages.find((p) => p.id === wantedId)) || pages[0]
    const encrypted = encryptToken(page.access_token)

    const fb = await SocialAccount.findOneAndUpdate(
      { platform: 'facebook' },
      {
        platform: 'facebook',
        name: page.name,
        connected: true,
        externalAccountId: page.id,
        accessToken: encrypted,
        connectedBy: user._id,
        lastSyncError: null,
      },
      { upsert: true, new: true },
    )

    let ig = null
    if (page.instagram_business_account?.id) {
      ig = await SocialAccount.findOneAndUpdate(
        { platform: 'instagram' },
        {
          platform: 'instagram',
          name: page.instagram_business_account.username || page.name,
          connected: true,
          externalAccountId: page.instagram_business_account.id,
          accessToken: encrypted, // IG Graph calls use the linked page token
          connectedBy: user._id,
          lastSyncError: null,
        },
        { upsert: true, new: true },
      )
    }

    // Pull real followers/engagement right away; a failure here is shown on the card.
    await Promise.allSettled([fb, ig].filter(Boolean).map((a) => syncAccount(String(a!._id))))

    return back(`/accounts?connected=${ig ? 'meta' : 'facebook'}`)
  } catch (err) {
    console.error('[meta callback]', err)
    return back('/accounts?error=meta_failed')
  }
}
