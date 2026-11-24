import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/server/db'
import { SocialAccount } from '@/lib/server/models/SocialAccount'
import { requireUser } from '@/lib/server/requireUser'
import { handleApiError } from '@/lib/server/handleApiError'

export async function GET(req: NextRequest) {
  try {
    await requireUser(req)
    await connectDB()
    const accounts = await SocialAccount.find()
    return NextResponse.json({ success: true, accounts })
  } catch (err) {
    return handleApiError(err)
  }
}
