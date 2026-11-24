import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/server/db'
import { User } from '@/lib/server/models/User'
import { requireUser } from '@/lib/server/requireUser'
import { handleApiError } from '@/lib/server/handleApiError'

export async function PUT(req: NextRequest) {
  try {
    const authedUser = await requireUser(req)
    await connectDB()

    const { currentPassword, newPassword } = await req.json()
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'Current and new password are required' },
        { status: 400 },
      )
    }

    const user = await User.findById(authedUser._id).select('+password')
    if (!user || !(await user.comparePassword(currentPassword))) {
      return NextResponse.json({ success: false, message: 'Current password is incorrect' }, { status: 401 })
    }

    user.password = newPassword
    await user.save()
    return NextResponse.json({ success: true, message: 'Password updated' })
  } catch (err) {
    return handleApiError(err)
  }
}
