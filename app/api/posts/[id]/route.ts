import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/server/db'
import { Post } from '@/lib/server/models/Post'
import { requireUser } from '@/lib/server/requireUser'
import { handleApiError } from '@/lib/server/handleApiError'
import { validatePlatforms } from '@/lib/platforms'

type Params = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Params) {
  try {
    await requireUser(req)
    await connectDB()
    const { id } = await params

    const post = await Post.findById(id).populate('media').populate('author', 'name avatar')
    if (!post) {
      return NextResponse.json({ success: false, message: 'Post not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, post })
  } catch (err) {
    return handleApiError(err)
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    await requireUser(req)
    await connectDB()
    const { id } = await params

    const post = await Post.findById(id)
    if (!post) {
      return NextResponse.json({ success: false, message: 'Post not found' }, { status: 404 })
    }

    const body = await req.json()
    if (body.platforms !== undefined) {
      const platformError = validatePlatforms(body.platforms)
      if (platformError) {
        return NextResponse.json({ success: false, message: platformError }, { status: 400 })
      }
    }
    const fields = ['content', 'platforms', 'status', 'scheduledAt', 'media'] as const
    fields.forEach((f) => {
      if (body[f] !== undefined) (post as any)[f] = body[f]
    })
    if (body.status === 'published' && !post.publishedAt) {
      post.publishedAt = new Date()
    }

    await post.save()
    return NextResponse.json({ success: true, post })
  } catch (err) {
    return handleApiError(err)
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    await requireUser(req)
    await connectDB()
    const { id } = await params

    const post = await Post.findByIdAndDelete(id)
    if (!post) {
      return NextResponse.json({ success: false, message: 'Post not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, message: 'Post deleted' })
  } catch (err) {
    return handleApiError(err)
  }
}
