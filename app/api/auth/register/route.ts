import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/server/db'
import { User } from '@/lib/server/models/User'
import { generateToken, cookieOptions, COOKIE_NAME } from '@/lib/server/jwt'
import { handleApiError } from '@/lib/server/handleApiError'

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    // Staff accounts are not open sign-up. Registration works only to create
    // the very first user, or when ALLOW_REGISTRATION=true.
    if (process.env.ALLOW_REGISTRATION !== 'true' && (await User.estimatedDocumentCount()) > 0) {
      return NextResponse.json(
        { success: false, message: 'Registration is closed. Ask an admin to create your account.' },
        { status: 403 },
      )
    }

    const { name, email, password, company } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Name, email and password are required' },
        { status: 400 },
      )
    }

    const existing = await User.findOne({ email })
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'An account with this email already exists' },
        { status: 409 },
      )
    }

    const user = await User.create({ name, email, password, company })
    const token = generateToken(user._id.toString())

    const res = NextResponse.json(
      { success: true, token, user: user.toSafeObject() },
      { status: 201 },
    )
    res.cookies.set(COOKIE_NAME, token, cookieOptions)
    return res
  } catch (err) {
    return handleApiError(err)
  }
}
