import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/server/db'
import { User } from '@/lib/server/models/User'
import { generateToken, cookieOptions, COOKIE_NAME } from '@/lib/server/jwt'
import { handleApiError } from '@/lib/server/handleApiError'

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 },
      )
    }

    const user = await User.findOne({ email }).select('+password')
    if (!user || !(await user.comparePassword(password))) {
      return NextResponse.json({ success: false, message: 'Invalid email or password' }, { status: 401 })
    }

    const token = generateToken(user._id.toString())

    const res = NextResponse.json({ success: true, token, user: user.toSafeObject() })
    res.cookies.set(COOKIE_NAME, token, cookieOptions)
    return res
  } catch (err) {
    return handleApiError(err)
  }
}
