import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/server/db'
import { Post } from '@/lib/server/models/Post'
import { requireUser } from '@/lib/server/requireUser'
import { handleApiError } from '@/lib/server/handleApiError'

export async function GET(req: NextRequest) {
  try {
    await requireUser(req)
    await connectDB()

    const [published, total, failed, engagementAgg] = await Promise.all([
      Post.countDocuments({ status: 'published' }),
      Post.countDocuments(),
      Post.countDocuments({ status: 'failed' }),
      Post.aggregate([
        { $match: { status: 'published' } },
        {
          $group: {
            _id: null,
            likes: { $sum: '$engagement.likes' },
            comments: { $sum: '$engagement.comments' },
            shares: { $sum: '$engagement.shares' },
          },
        },
      ]),
    ])

    const successRate = total > 0 ? Math.round(((total - failed) / total) * 100) : 100
    const engagement = engagementAgg[0]
      ? engagementAgg[0].likes + engagementAgg[0].comments + engagementAgg[0].shares
      : 0

    return NextResponse.json({
      success: true,
      stats: [
        { label: 'Posts Published', value: published, delta: 0, trend: 'up' },
        { label: 'Total Engagement', value: engagement, delta: 0, trend: 'up' },
        { label: 'Avg. Reach', value: engagement * 4, delta: 0, trend: 'up' },
        { label: 'Success Rate', value: successRate, delta: 0, trend: 'up' },
      ],
    })
  } catch (err) {
    return handleApiError(err)
  }
}
