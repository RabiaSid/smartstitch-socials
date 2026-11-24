import type { IPost } from '../models/Post'
import { SocialAccount } from '../models/SocialAccount'
import { publishToFacebook } from './facebookService'
import { publishToInstagram } from './instagramService'
import { publishToLinkedIn } from './linkedinService'
import { platformConfig } from '../../platforms'
import { decryptToken } from '../crypto'

// Publishes a single post to every selected platform. Any platform failure
// marks the whole post as 'failed' with a reason, so it surfaces in the UI.
export async function publishPost(post: IPost) {
  const platformPostIds = { ...post.platformPostIds }
  const mediaUrl = undefined // TODO: resolve post.media[0] → url once media is populated

  try {
    // Block disabled platforms (e.g. LinkedIn/TikTok while "coming soon")
    // before touching any API, so nothing is half-published.
    for (const platform of post.platforms) {
      if (!platformConfig[platform]?.enabled) {
        throw new Error(platformConfig[platform]?.disabledNote || `${platform} is not enabled`)
      }
    }

    for (const platform of post.platforms) {
      const account = await SocialAccount.findOne({ platform, connected: true }).select('+accessToken')
      if (!account) {
        throw new Error(`No connected ${platform} account`)
      }
      const accessToken = decryptToken(account.accessToken)
      if (!accessToken) {
        throw new Error(`No access token for ${platform}`)
      }

      if (platform === 'facebook') {
        const { platformPostId } = await publishToFacebook({
          pageId: account.externalAccountId as string,
          accessToken,
          message: post.content,
          mediaUrl,
        })
        platformPostIds.facebook = platformPostId
      }

      if (platform === 'instagram') {
        const { platformPostId } = await publishToInstagram({
          igUserId: account.externalAccountId as string,
          accessToken,
          caption: post.content,
          mediaUrl,
        })
        platformPostIds.instagram = platformPostId
      }

      if (platform === 'linkedin') {
        const { platformPostId } = await publishToLinkedIn({
          organizationUrn: account.externalAccountId as string,
          accessToken,
          text: post.content,
        })
        platformPostIds.linkedin = platformPostId
      }

      if (platform === 'tiktok') {
        // TODO: TikTok Content Posting API (needs app review). Blocked above until enabled.
        throw new Error('TikTok publishing is not implemented yet')
      }
    }

    post.status = 'published'
    post.publishedAt = new Date()
    post.platformPostIds = platformPostIds
    post.failureReason = null
  } catch (err) {
    post.status = 'failed'
    post.failureReason = err instanceof Error ? err.message : 'Unknown publishing error'
  }

  await post.save()
  return post
}

// Finds every scheduled post whose time has arrived and publishes it.
export async function publishDuePosts() {
  const { Post } = await import('../models/Post')
  const duePosts = await Post.find({ status: 'scheduled', scheduledAt: { $lte: new Date() } })

  for (const post of duePosts) {
    await publishPost(post)
  }

  return duePosts.length
}
