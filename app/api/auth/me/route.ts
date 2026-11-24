import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/server/requireUser'
import { handleApiError } from '@/lib/server/handleApiError'

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser(req)
    return NextResponse.json({ success: true, user: user.toSafeObject() })
  } catch (err) {
    return handleApiError(err)
  }
}
