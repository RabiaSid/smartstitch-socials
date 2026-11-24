import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/server/db'
import { Post } from '@/lib/server/models/Post'
import { requireUser } from '@/lib/server/requireUser'
import { handleApiError } from '@/lib/server/handleApiError'
import { PLATFORMS, platformConfig } from '@/lib/platforms'

export async function GET(req: NextRequest) {
  try {
    await requireUser(req)
    await connectDB()

    const posts = await Post.find({}, 'platforms')
    const counts: Record<string, number> = Object.fromEntries(PLATFORMS.map((p) => [p, 0]))
    let totalTags = 0

    posts.forEach((p) => {
      p.platforms.forEach((platform) => {
        counts[platform] = (counts[platform] || 0) + 1
        totalTags += 1
      })
    })

    const distribution = Object.entries(counts).map(([key, count]) => ({
      key,
      platform: platformConfig[key as keyof typeof platformConfig]?.label ?? key,
      enabled: platformConfig[key as keyof typeof platformConfig]?.enabled ?? false,
      value: totalTags > 0 ? Math.round((count / totalTags) * 100) : 0,
    }))

    return NextResponse.json({ success: true, distribution })
  } catch (err) {
    return handleApiError(err)
  }
}
