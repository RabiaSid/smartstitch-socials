import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/server/db'
import { User } from '@/lib/server/models/User'
import { requireUser } from '@/lib/server/requireUser'
import { handleApiError } from '@/lib/server/handleApiError'
import { COOKIE_NAME } from '@/lib/server/jwt'

export async function DELETE(req: NextRequest) {
  try {
    const user = await requireUser(req)
    await connectDB()
    await User.findByIdAndDelete(user._id)

    const res = NextResponse.json({ success: true, message: 'Account deleted' })
    res.cookies.delete(COOKIE_NAME)
    return res
  } catch (err) {
    return handleApiError(err)
  }
}
