// Meta Graph API: OAuth exchange + reading real Facebook Page / Instagram
// Business stats. Official API only (no scraping), per the social spec.
//
// Note: Meta deprecated page/post reach metrics in 2026, so we use followers
// plus likes/comments/shares from recent posts instead of reach insights.

export const GRAPH_VERSION = process.env.META_GRAPH_VERSION || 'v26.0'
export const GRAPH_URL = `https://graph.facebook.com/${GRAPH_VERSION}`

export const META_SCOPES = [
  'pages_show_list',
  'pages_read_engagement',
  'pages_read_user_content',
  'pages_manage_posts',
  'business_management',
  'instagram_basic',
  'instagram_content_publish',
].join(',')

export const META_STATE_COOKIE = 'meta_oauth_state'

const RECENT_POSTS_LIMIT = 25

async function graphGet<T>(path: string, params: Record<string, string>): Promise<T> {
  const qs = new URLSearchParams(params)
  const res = await fetch(`${GRAPH_URL}${path}?${qs.toString()}`, { cache: 'no-store' })
  const data = await res.json()
  if (!res.ok || data?.error) {
    throw new Error(data?.error?.message || `Meta API error on ${path}`)
  }
  return data as T
}

// ---------- OAuth ----------

export async function exchangeCodeForLongLivedUserToken(code: string) {
  const appId = process.env.FACEBOOK_APP_ID || ''
  const appSecret = process.env.FACEBOOK_APP_SECRET || ''
  const redirectUri = process.env.FACEBOOK_REDIRECT_URI || ''

  const short = await graphGet<{ access_token: string }>('/oauth/access_token', {
    client_id: appId,
    client_secret: appSecret,
    redirect_uri: redirectUri,
    code,
  })

  const long = await graphGet<{ access_token: string; expires_in?: number }>('/oauth/access_token', {
    grant_type: 'fb_exchange_token',
    client_id: appId,
    client_secret: appSecret,
    fb_exchange_token: short.access_token,
  })

  return long.access_token
}

export interface ManagedPage {
  id: string
  name: string
  access_token: string // page token; non-expiring when derived from a long-lived user token
  instagram_business_account?: { id: string; username?: string }
}

export async function getManagedPages(userToken: string) {
  const data = await graphGet<{ data: ManagedPage[] }>('/me/accounts', {
    access_token: userToken,
    fields: 'id,name,access_token,instagram_business_account{id,username}',
    limit: '100',
  })
  return data.data
}

// ---------- Stats ----------

export interface AccountStats {
  name: string
  handle: string
  avatar: string
  profileUrl: string
  followers: number
  postsCount: number | null
  recent: { posts: number; likes: number; comments: number; shares: number }
  /** Partial success: stats saved, but something could not be read. */
  warning?: string
}

export async function fetchFacebookPageStats(pageId: string, pageToken: string): Promise<AccountStats> {
  const page = await graphGet<{
    name: string
    username?: string
    link?: string
    followers_count?: number
    fan_count?: number
    picture?: { data?: { url?: string } }
  }>(`/${pageId}`, {
    access_token: pageToken,
    fields: 'name,username,link,followers_count,fan_count,picture{url}',
  })

  // Post engagement needs pages_read_user_content. If it is missing, still
  // return followers and report the problem as a warning instead of failing.
  let postsData: {
    reactions?: { summary?: { total_count?: number } }
    comments?: { summary?: { total_count?: number } }
    shares?: { count?: number }
  }[] = []
  let warning: string | undefined
  try {
    const posts = await graphGet<{ data: typeof postsData }>(`/${pageId}/published_posts`, {
      access_token: pageToken,
      fields: 'id,reactions.summary(true).limit(0),comments.summary(true).limit(0),shares',
      limit: String(RECENT_POSTS_LIMIT),
    })
    postsData = posts.data
  } catch (err) {
    warning = `Followers synced, but post engagement could not be read: ${
      err instanceof Error ? err.message : 'unknown error'
    }. Reconnect Facebook to grant the new permission.`
  }

  const recent = postsData.reduce(
    (acc, p) => ({
      posts: acc.posts + 1,
      likes: acc.likes + (p.reactions?.summary?.total_count ?? 0),
      comments: acc.comments + (p.comments?.summary?.total_count ?? 0),
      shares: acc.shares + (p.shares?.count ?? 0),
    }),
    { posts: 0, likes: 0, comments: 0, shares: 0 },
  )

  return {
    name: page.name,
    handle: page.username ? `/${page.username}` : page.name,
    avatar: page.picture?.data?.url ?? '',
    profileUrl: page.link ?? `https://facebook.com/${pageId}`,
    followers: page.followers_count ?? page.fan_count ?? 0,
    postsCount: null,
    recent,
    warning,
  }
}

export async function fetchInstagramStats(igUserId: string, pageToken: string): Promise<AccountStats> {
  const ig = await graphGet<{
    username: string
    name?: string
    followers_count?: number
    media_count?: number
    profile_picture_url?: string
  }>(`/${igUserId}`, {
    access_token: pageToken,
    fields: 'username,name,followers_count,media_count,profile_picture_url',
  })

  const media = await graphGet<{ data: { like_count?: number; comments_count?: number }[] }>(
    `/${igUserId}/media`,
    {
      access_token: pageToken,
      fields: 'id,like_count,comments_count',
      limit: String(RECENT_POSTS_LIMIT),
    },
  )

  const recent = media.data.reduce(
    (acc, m) => ({
      posts: acc.posts + 1,
      likes: acc.likes + (m.like_count ?? 0),
      comments: acc.comments + (m.comments_count ?? 0),
      shares: acc.shares,
    }),
    { posts: 0, likes: 0, comments: 0, shares: 0 },
  )

  return {
    name: ig.name || ig.username,
    handle: `@${ig.username}`,
    avatar: ig.profile_picture_url ?? '',
    profileUrl: `https://instagram.com/${ig.username}`,
    followers: ig.followers_count ?? 0,
    postsCount: ig.media_count ?? null,
    recent,
  }
}

// ---------- Past posts (for Posts, Calendar and Media Library) ----------

export interface PlatformPost {
  id: string
  caption: string
  createdAt: string
  permalink: string | null
  mediaType: 'image' | 'video' | null
  /** Display image (for videos: the thumbnail). CDN links expire, so they are refreshed on every sync. */
  imageUrl: string | null
  likes: number
  comments: number
  shares: number
}

const IMPORT_LIMIT = 50

export async function fetchInstagramPosts(igUserId: string, pageToken: string): Promise<PlatformPost[]> {
  const res = await graphGet<{
    data: {
      id: string
      caption?: string
      media_type?: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
      media_url?: string
      thumbnail_url?: string
      permalink?: string
      timestamp: string
      like_count?: number
      comments_count?: number
    }[]
  }>(`/${igUserId}/media`, {
    access_token: pageToken,
    fields: 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count',
    limit: String(IMPORT_LIMIT),
  })

  return res.data.map((m) => ({
    id: m.id,
    caption: m.caption ?? '',
    createdAt: m.timestamp,
    permalink: m.permalink ?? null,
    mediaType: m.media_type === 'VIDEO' ? 'video' : m.media_url || m.thumbnail_url ? 'image' : null,
    imageUrl: m.media_type === 'VIDEO' ? (m.thumbnail_url ?? null) : (m.media_url ?? null),
    likes: m.like_count ?? 0,
    comments: m.comments_count ?? 0,
    shares: 0,
  }))
}

export async function fetchFacebookPosts(pageId: string, pageToken: string): Promise<PlatformPost[]> {
  const res = await graphGet<{
    data: {
      id: string
      message?: string
      created_time: string
      permalink_url?: string
      full_picture?: string
      attachments?: { data?: { media_type?: string }[] }
      reactions?: { summary?: { total_count?: number } }
      comments?: { summary?: { total_count?: number } }
      shares?: { count?: number }
    }[]
  }>(`/${pageId}/published_posts`, {
    access_token: pageToken,
    fields:
      'id,message,created_time,permalink_url,full_picture,attachments{media_type},' +
      'reactions.summary(true).limit(0),comments.summary(true).limit(0),shares',
    limit: String(IMPORT_LIMIT),
  })

  return res.data.map((p) => {
    const type = p.attachments?.data?.[0]?.media_type
    return {
      id: p.id,
      caption: p.message ?? '',
      createdAt: p.created_time,
      permalink: p.permalink_url ?? null,
      mediaType: p.full_picture ? (type === 'video' ? 'video' : 'image') : null,
      imageUrl: p.full_picture ?? null,
      likes: p.reactions?.summary?.total_count ?? 0,
      comments: p.comments?.summary?.total_count ?? 0,
      shares: p.shares?.count ?? 0,
    }
  })
}
