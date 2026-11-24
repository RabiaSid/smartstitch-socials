import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/server/db'
import { SocialAccount } from '@/lib/server/models/SocialAccount'
import { requireUser } from '@/lib/server/requireUser'
import { handleApiError } from '@/lib/server/handleApiError'

type Params = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  try {
    await requireUser(req)
    await connectDB()
    const { id } = await params

    const account = await SocialAccount.findByIdAndUpdate(
      id,
      { connected: false, accessToken: null, refreshToken: null, lastSyncError: null },
      { new: true },
    )
    if (!account) {
      return NextResponse.json({ success: false, message: 'Account not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, account })
  } catch (err) {
    return handleApiError(err)
  }
}
