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

    const result = await Post.updateMany(
      { _id: { $in: ids } },
      { $set: { status: 'published', publishedAt: new Date() } },
    )
    return NextResponse.json({ success: true, modifiedCount: result.modifiedCount })
  } catch (err) {
    return handleApiError(err)
  }
}
