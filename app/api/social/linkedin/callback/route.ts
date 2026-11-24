import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/server/db'
import { SocialAccount } from '@/lib/server/models/SocialAccount'
import { platformConfig } from '@/lib/platforms'

export async function GET(req: NextRequest) {
  if (!platformConfig.linkedin.enabled) {
    return NextResponse.redirect(`${process.env.CLIENT_URL || ''}/accounts?error=linkedin_disabled`)
  }

  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.json({ success: false, message: 'Missing OAuth code from LinkedIn' }, { status: 400 })
  }

  await connectDB()

  // TODO: exchange `code` for a real access token and store it below.
  await SocialAccount.findOneAndUpdate(
    { platform: 'linkedin' },
    { connected: true, lastSync: new Date() },
    { upsert: true },
  )

  return NextResponse.redirect(`${process.env.CLIENT_URL || ''}/accounts?connected=linkedin`)
}
