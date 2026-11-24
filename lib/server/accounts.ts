import { PLATFORMS } from '@/lib/platforms'
import type { SocialAccount as SocialAccountDTO } from '@/lib/types'
import { connectDB } from './db'
import { SocialAccount, type ISocialAccount } from './models/SocialAccount'

// Real accounts from MongoDB, one card per platform. Platforms that were
// never connected get an empty "Not connected" card (no fake numbers).
export async function getAccountsForUI(): Promise<SocialAccountDTO[]> {
  let docs: (ISocialAccount & { _id: unknown })[] = []
  try {
    await connectDB()
    docs = await SocialAccount.find().lean<(ISocialAccount & { _id: unknown })[]>()
  } catch (err) {
    console.error('[accounts] could not load from DB', err)
  }

  return PLATFORMS.map((platform) => {
    const d = docs.find((x) => x.platform === platform)
    if (!d) {
      return {
        id: `placeholder-${platform}`,
        platform,
        name: 'SmartStitch',
        handle: '',
        connected: false,
        followers: 0,
        lastSync: null,
        avatar: '',
      }
    }
    return {
      id: String(d._id),
      platform,
      name: d.name,
      handle: d.handle,
      connected: d.connected,
      followers: d.followers ?? 0,
      lastSync: d.lastSync ? new Date(d.lastSync).toISOString() : null,
      avatar: d.avatar ?? '',
      profileUrl: d.profileUrl ?? '',
      postsCount: d.postsCount ?? null,
      recentEngagement: d.recentEngagement
        ? {
            posts: d.recentEngagement.posts ?? 0,
            likes: d.recentEngagement.likes ?? 0,
            comments: d.recentEngagement.comments ?? 0,
            shares: d.recentEngagement.shares ?? 0,
          }
        : undefined,
      lastSyncError: d.lastSyncError ?? null,
    }
  })
}
