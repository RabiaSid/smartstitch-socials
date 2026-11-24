import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/server/db'
import { Post } from '@/lib/server/models/Post'
import { requireUser } from '@/lib/server/requireUser'
import { handleApiError } from '@/lib/server/handleApiError'

export async function POST(req: NextRequest) {
  try {
    await requireUser(req)
    await connectDB()

    const { ids } = await req.json()
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: false, message: 'ids array is required' }, { status: 400 })
    }

    const result = await Post.deleteMany({ _id: { $in: ids } })
    return NextResponse.json({ success: true, deletedCount: result.deletedCount })
  } catch (err) {
    return handleApiError(err)
  }
}
