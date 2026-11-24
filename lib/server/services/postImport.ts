import type { Types } from 'mongoose'
import type { ISocialAccount } from '../models/SocialAccount'
import { Post } from '../models/Post'
import { MediaAsset } from '../models/MediaAsset'
import { User } from '../models/User'
import { fetchFacebookPosts, fetchInstagramPosts, type PlatformPost } from './metaService'

// Copies the account's recent real posts into social_posts and their images
// into social_assets, so Posts, Calendar and Media Library show history from
// before the dashboard existed. Safe to run repeatedly (upserts by platform id).
export async function importRecentPosts(account: ISocialAccount, token: string) {
  const platform = account.platform
  if (platform !== 'instagram' && platform !== 'facebook') return { imported: 0 }
  if (!account.externalAccountId) return { imported: 0 }

  const items: PlatformPost[] =
    platform === 'instagram'
      ? await fetchInstagramPosts(account.externalAccountId, token)
      : await fetchFacebookPosts(account.externalAccountId, token)

  const authorId: Types.ObjectId | undefined =
    (account.connectedBy as Types.ObjectId | undefined) ??
    ((await User.findOne({}, '_id').lean())?._id as Types.ObjectId | undefined)
  if (!authorId) return { imported: 0 }

  let imported = 0
  for (const item of items) {
    // Image -> media library (one asset per platform post)
    let assetId: Types.ObjectId | null = null
    if (item.imageUrl && item.mediaType) {
      const asset = await MediaAsset.findOneAndUpdate(
        { externalId: `${platform}:${item.id}` },
        {
          $set: { url: item.imageUrl, permalink: item.permalink, postedAt: new Date(item.createdAt) },
          $setOnInsert: {
            name: `${platform}-${item.createdAt.slice(0, 10)}-${item.id.slice(-6)}.${item.mediaType === 'video' ? 'mp4' : 'jpg'}`,
            type: item.mediaType,
            folder: platform === 'instagram' ? 'Instagram' : 'Facebook',
            source: platform,
            size: '—',
            bytes: 0,
            uploadedBy: authorId,
          },
        },
        { upsert: true, new: true },
      )
      assetId = asset._id as Types.ObjectId
    }

    const idField = `platformPostIds.${platform}`
    const existing = await Post.findOne({ [idField]: item.id })
    const engagement = { likes: item.likes, comments: item.comments, shares: item.shares }

    if (existing && existing.source !== 'imported') {
      // Published from this dashboard: only refresh live numbers and the link.
      existing.engagement = engagement
      existing.permalink = item.permalink
      await existing.save()
      continue
    }

    await Post.updateOne(
      { [idField]: item.id },
      {
        $set: {
          content: item.caption || '(no caption)',
          platforms: [platform],
          status: 'published',
          publishedAt: new Date(item.createdAt),
          scheduledAt: null,
          engagement,
          permalink: item.permalink,
          media: assetId ? [assetId] : [],
          source: 'imported',
          author: authorId,
          [idField]: item.id,
        },
      },
      { upsert: true },
    )
    imported++
  }
  return { imported }
}
