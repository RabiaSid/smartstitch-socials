import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/server/db'
import { Post } from '@/lib/server/models/Post'
import { requireUser } from '@/lib/server/requireUser'
import { handleApiError } from '@/lib/server/handleApiError'
import { validatePlatforms } from '@/lib/platforms'

export async function GET(req: NextRequest) {
  try {
    await requireUser(req)
    await connectDB()

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const page = Number(searchParams.get('page') || 1)
    const limit = Number(searchParams.get('limit') || 10)
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    const filter: Record<string, unknown> = {}
    if (status && status !== 'all') filter.status = status
    if (search) filter.content = { $regex: search, $options: 'i' }
    if (from || to) {
      filter.scheduledAt = {
        ...(from ? { $gte: new Date(from) } : {}),
        ...(to ? { $lte: new Date(to) } : {}),
      }
    }

    const skip = (page - 1) * limit
    const [posts, total] = await Promise.all([
      Post.find(filter)
        .populate('media')
        .populate('author', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Post.countDocuments(filter),
    ])

    return NextResponse.json({
      success: true,
      posts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (err) {
    return handleApiError(err)
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(req)
    await connectDB()

    const { content, platforms, status, scheduledAt, media } = await req.json()

    if (!content || !platforms?.length) {
      return NextResponse.json(
        { success: false, message: 'Post content and at least one platform are required' },
        { status: 400 },
      )
    }

    const platformError = validatePlatforms(platforms)
    if (platformError) {
      return NextResponse.json({ success: false, message: platformError }, { status: 400 })
    }

    const post = await Post.create({
      content,
      platforms,
      status: status || (scheduledAt ? 'scheduled' : 'draft'),
      scheduledAt: scheduledAt || null,
      media: media || [],
      author: user._id,
      publishedAt: status === 'published' ? new Date() : null,
    })

    return NextResponse.json({ success: true, post }, { status: 201 })
  } catch (err) {
    return handleApiError(err)
  }
}
