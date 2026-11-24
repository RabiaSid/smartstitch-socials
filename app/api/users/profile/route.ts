import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/server/db'
import { requireUser } from '@/lib/server/requireUser'
import { handleApiError } from '@/lib/server/handleApiError'

export async function PUT(req: NextRequest) {
  try {
    const user = await requireUser(req)
    await connectDB()

    const { name, email, company, timezone, theme } = await req.json()

    if (name !== undefined) user.name = name
    if (email !== undefined) user.email = email
    if (company !== undefined) user.company = company
    if (timezone !== undefined) user.timezone = timezone
    if (theme !== undefined) user.theme = theme

    await user.save()
    return NextResponse.json({ success: true, user: user.toSafeObject() })
  } catch (err) {
    return handleApiError(err)
  }
}
