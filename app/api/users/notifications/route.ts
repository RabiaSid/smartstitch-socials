import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/server/db'
import { requireUser } from '@/lib/server/requireUser'
import { handleApiError } from '@/lib/server/handleApiError'

export async function PUT(req: NextRequest) {
  try {
    const user = await requireUser(req)
    await connectDB()

    const body = await req.json()
    user.notificationSettings = { ...user.notificationSettings, ...body }
    await user.save()

    return NextResponse.json({ success: true, notificationSettings: user.notificationSettings })
  } catch (err) {
    return handleApiError(err)
  }
}
