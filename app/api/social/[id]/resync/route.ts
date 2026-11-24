import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/server/db'
import { SocialAccount } from '@/lib/server/models/SocialAccount'
import { syncAccount } from '@/lib/server/services/accountSync'
import { requireUser } from '@/lib/server/requireUser'
import { handleApiError } from '@/lib/server/handleApiError'

type Params = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  try {
    await requireUser(req)
    await connectDB()
    const { id } = await params

    const exists = await SocialAccount.exists({ _id: id })
    if (!exists) {
      return NextResponse.json({ success: false, message: 'Account not found' }, { status: 404 })
    }

    try {
      const account = await syncAccount(id)
      return NextResponse.json({ success: true, account })
    } catch (err) {
      return NextResponse.json(
        { success: false, message: err instanceof Error ? err.message : 'Sync failed', code: 'SYNC_FAILED' },
        { status: 502 },
      )
    }
  } catch (err) {
    return handleApiError(err)
  }
}
