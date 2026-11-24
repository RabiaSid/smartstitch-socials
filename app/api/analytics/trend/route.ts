import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/server/db'
import { Post } from '@/lib/server/models/Post'
import { requireUser } from '@/lib/server/requireUser'
import { handleApiError } from '@/lib/server/handleApiError'

export async function GET(req: NextRequest) {
  try {
    await requireUser(req)
    await connectDB()

    const trend = await Post.aggregate([
      { $match: { status: 'published', publishedAt: { $ne: null } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$publishedAt' } },
          posts: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ])

    return NextResponse.json({ success: true, trend })
  } catch (err) {
    return handleApiError(err)
  }
}
