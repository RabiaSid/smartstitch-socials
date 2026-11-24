import { SocialAccount, type ISocialAccount } from '../models/SocialAccount'
import { AccountSnapshot } from '../models/AccountSnapshot'
import { decryptToken } from '../crypto'
import { fetchFacebookPageStats, fetchInstagramStats, type AccountStats } from './metaService'
import { importRecentPosts } from './postImport'

// Pulls fresh stats for one connected account from the platform API, saves
// them on the account, and upserts today's snapshot for growth charts.
export async function syncAccount(accountId: string) {
  const account = await SocialAccount.findById(accountId).select('+accessToken')
  if (!account) throw new Error('Account not found')
  if (!account.connected || !account.externalAccountId) {
    throw new Error(`${account.platform} is not connected`)
  }

  const token = decryptToken(account.accessToken)
  if (!token) throw new Error(`No access token stored for ${account.platform}`)

  let stats: AccountStats
  try {
    if (account.platform === 'facebook') {
      stats = await fetchFacebookPageStats(account.externalAccountId, token)
    } else if (account.platform === 'instagram') {
      stats = await fetchInstagramStats(account.externalAccountId, token)
    } else {
      throw new Error(`Live stats are not available for ${account.platform} yet`)
    }
  } catch (err) {
    account.lastSyncError = err instanceof Error ? err.message : 'Sync failed'
    await account.save()
    throw err
  }

  applyStats(account, stats)

  // Past posts -> Posts, Calendar, Media Library. A failure here keeps the
  // follower stats and shows a warning on the account card.
  try {
    await importRecentPosts(account, token)
  } catch (err) {
    const msg = `Stats synced, but past posts could not be imported: ${
      err instanceof Error ? err.message : 'unknown error'
    }`
    account.lastSyncError = account.lastSyncError ? `${account.lastSyncError} ${msg}` : msg
  }

  await account.save()

  const date = new Date().toISOString().slice(0, 10)
  await AccountSnapshot.findOneAndUpdate(
    { platform: account.platform, date },
    {
      followers: stats.followers,
      recentLikes: stats.recent.likes,
      recentComments: stats.recent.comments,
      recentShares: stats.recent.shares,
      recentPosts: stats.recent.posts,
    },
    { upsert: true },
  )

  return account
}

function applyStats(account: ISocialAccount, stats: AccountStats) {
  account.name = stats.name
  account.handle = stats.handle
  account.avatar = stats.avatar
  account.profileUrl = stats.profileUrl
  account.followers = stats.followers
  account.postsCount = stats.postsCount
  account.recentEngagement = stats.recent
  account.lastSync = new Date()
  account.lastSyncError = stats.warning ?? null
}

// Syncs every connected account; failures are recorded per account, not thrown.
export async function syncAllAccounts() {
  const accounts = await SocialAccount.find({ connected: true }, '_id platform')
  const results: { platform: string; ok: boolean; error?: string }[] = []
  for (const a of accounts) {
    try {
      await syncAccount(String(a._id))
      results.push({ platform: a.platform, ok: true })
    } catch (err) {
      results.push({ platform: a.platform, ok: false, error: err instanceof Error ? err.message : 'failed' })
    }
  }
  return results
}
