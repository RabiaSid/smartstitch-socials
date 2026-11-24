import type { Types } from 'mongoose'
import { connectDB } from './db'
import { Post } from './models/Post'
import { MediaAsset } from './models/MediaAsset'
import type { MediaAsset as MediaDTO, Post as PostDTO } from '@/lib/types'

type PopulatedMedia = { _id: Types.ObjectId; url: string }

// Real posts from MongoDB (created in the dashboard + imported from platforms).
export async function getPostsForUI(): Promise<PostDTO[]> {
  try {
    await connectDB()
    const docs = await Post.find()
      .sort({ publishedAt: -1, scheduledAt: -1, createdAt: -1 })
      .limit(500)
      .populate<{ media: PopulatedMedia[] }>('media', 'url')
      .lean()

    return docs.map((p) => ({
      id: String(p._id),
      content: p.content,
      platforms: p.platforms,
      status: p.status,
      scheduledAt: p.scheduledAt ? new Date(p.scheduledAt).toISOString() : null,
      publishedAt: p.publishedAt ? new Date(p.publishedAt).toISOString() : null,
      media: (p.media ?? []).map((m) => m.url).filter(Boolean),
      author: String(p.author),
      engagement: p.engagement,
      permalink: p.permalink ?? null,
      source: p.source ?? 'dashboard',
    }))
  } catch (err) {
    console.error('[content] could not load posts', err)
    return []
  }
}

export async function getMediaForUI(): Promise<{ assets: MediaDTO[]; folders: string[] }> {
  try {
    await connectDB()
    const docs = await MediaAsset.find().sort({ postedAt: -1, uploadedAt: -1 }).limit(500).lean()
    const assets: MediaDTO[] = docs.map((m) => ({
      id: String(m._id),
      name: m.name,
      type: m.type,
      url: m.url,
      size: m.size,
      folder: m.folder,
      uploadedAt: new Date(
        (m.postedAt as Date | null) ?? (m as unknown as { uploadedAt: Date }).uploadedAt ?? Date.now(),
      ).toISOString(),
      permalink: m.permalink ?? null,
    }))
    const folders = ['All', ...Array.from(new Set(assets.map((a) => a.folder))).sort()]
    return { assets, folders }
  } catch (err) {
    console.error('[content] could not load media', err)
    return { assets: [], folders: ['All'] }
  }
}
