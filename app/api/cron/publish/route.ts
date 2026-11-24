import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/server/db'
import { publishDuePosts } from '@/lib/server/services/publisher'

// Call this on an interval (e.g. Vercel Cron, GitHub Actions, or the
// standalone worker in scripts/cron-worker.js) to auto-publish scheduled
// posts whose time has arrived. Protected by CRON_SECRET so it can't be
// triggered by anyone who doesn't know the secret.
export async function POST(req: NextRequest) {
  const headerSecret = req.headers.get('x-cron-secret')
  const bearerSecret = req.headers.get('authorization')?.replace('Bearer ', '')
  const providedSecret = headerSecret || bearerSecret

  if (!process.env.CRON_SECRET || providedSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  await connectDB()
  const count = await publishDuePosts()

  return NextResponse.json({ success: true, published: count })
}

// Vercel Cron sends GET requests — support both.
export async function GET(req: NextRequest) {
  return POST(req)
}
