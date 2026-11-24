import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/server/db'
import { syncAllAccounts } from '@/lib/server/services/accountSync'

// Daily follower/engagement sync (vercel.json: 01:00 UTC = 06:00 PKT).
// Protected by CRON_SECRET, same as /api/cron/publish.
export async function POST(req: NextRequest) {
  const headerSecret = req.headers.get('x-cron-secret')
  const bearerSecret = req.headers.get('authorization')?.replace('Bearer ', '')
  const providedSecret = headerSecret || bearerSecret

  if (!process.env.CRON_SECRET || providedSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  await connectDB()
  const results = await syncAllAccounts()
  return NextResponse.json({ success: true, results })
}

export async function GET(req: NextRequest) {
  return POST(req)
}
