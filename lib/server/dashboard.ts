import type { ActivityItem, Post, SocialAccount, StatCard } from '@/lib/types'
import { ENABLED_PLATFORMS, platformConfig, type Platform } from '@/lib/platforms'

// Everything on the dashboard derived from real posts/accounts (no dummy data).

const DAY = 86_400_000

function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? null : 100
  return Math.round(((current - previous) / previous) * 1000) / 10
}

const engagementOf = (p: Post) =>
  (p.engagement?.likes ?? 0) + (p.engagement?.comments ?? 0) + (p.engagement?.shares ?? 0)

export function buildStats(posts: Post[]): (StatCard & { hint?: string })[] {
  const now = Date.now()
  const published = posts.filter((p) => p.status === 'published')
  const inWindow = (p: Post, from: number, to: number) => {
    const t = p.publishedAt ? new Date(p.publishedAt).getTime() : 0
    return t >= from && t < to
  }
  const last30 = published.filter((p) => inWindow(p, now - 30 * DAY, now))
  const prev30 = published.filter((p) => inWindow(p, now - 60 * DAY, now - 30 * DAY))
  const eng = (list: Post[]) => list.reduce((s, p) => s + engagementOf(p), 0)

  const delta = (c: number, p: number) => {
    const d = pctChange(c, p)
    return { delta: d === null ? null : Math.abs(d), trend: (d ?? 0) >= 0 ? ('up' as const) : ('down' as const) }
  }

  return [
    {
      label: 'Published (30 days)',
      value: last30.length,
      ...delta(last30.length, prev30.length),
      hint: `${published.length.toLocaleString()} all time`,
    },
    {
      label: 'Engagement (30 days)',
      value: eng(last30),
      ...delta(eng(last30), eng(prev30)),
      hint: 'Likes, comments and shares',
    },
    {
      label: 'Scheduled',
      value: posts.filter((p) => p.status === 'scheduled').length,
      delta: null,
      trend: 'up',
      hint: 'Waiting to go out',
    },
    {
      label: 'Drafts',
      value: posts.filter((p) => p.status === 'draft').length,
      delta: null,
      trend: 'up',
      hint: posts.some((p) => p.status === 'failed')
        ? `${posts.filter((p) => p.status === 'failed').length} failed`
        : 'Ready to finish',
    },
  ]
}

export interface WeeklyEngagementRow {
  week: string
  [platform: string]: number | string
}

/** Engagement per platform for the last 8 weeks, by the week a post was published. */
export function buildWeeklyEngagement(posts: Post[]): { rows: WeeklyEngagementRow[]; platforms: Platform[] } {
  const weeks = 8
  const now = new Date()
  // Start of the current week (Monday, UTC)
  const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  monday.setUTCDate(monday.getUTCDate() - ((monday.getUTCDay() + 6) % 7))

  const starts = Array.from({ length: weeks }, (_, i) => monday.getTime() - (weeks - 1 - i) * 7 * DAY)
  const platforms = ENABLED_PLATFORMS
  const rows: WeeklyEngagementRow[] = starts.map((start) => {
    const row: WeeklyEngagementRow = {
      week: new Date(start).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' }),
    }
    for (const pl of platforms) row[pl] = 0
    return row
  })

  for (const p of posts) {
    if (p.status !== 'published' || !p.publishedAt) continue
    const t = new Date(p.publishedAt).getTime()
    const idx = starts.findIndex((s, i) => t >= s && t < (starts[i + 1] ?? s + 7 * DAY))
    if (idx === -1) continue
    for (const pl of p.platforms) {
      if (pl in rows[idx]) rows[idx][pl] = (rows[idx][pl] as number) + engagementOf(p)
    }
  }
  return { rows, platforms }
}

const shorten = (s: string, n = 60) => {
  const clean = s.replace(/\s+/g, ' ').trim()
  return clean.length > n ? `${clean.slice(0, n - 1)}…` : clean || '(no caption)'
}

export function buildActivity(posts: Post[], accounts: SocialAccount[], limit = 6): ActivityItem[] {
  const items: ActivityItem[] = []
  for (const p of posts) {
    const platform = p.platforms[0]
    const label = p.platforms.map((x) => platformConfig[x]?.label ?? x).join(', ')
    if (p.status === 'published' && p.publishedAt) {
      items.push({
        id: `pub-${p.id}`,
        type: 'published',
        message: `Published on ${label}: “${shorten(p.content)}”`,
        platform,
        timestamp: p.publishedAt,
      })
      if ((p.engagement?.comments ?? 0) >= 5) {
        items.push({
          id: `com-${p.id}`,
          type: 'comment',
          message: `${p.engagement!.comments} comments on “${shorten(p.content, 40)}”`,
          platform,
          timestamp: p.publishedAt,
        })
      }
    } else if (p.status === 'scheduled' && p.scheduledAt) {
      items.push({
        id: `sch-${p.id}`,
        type: 'scheduled',
        message: `Scheduled for ${label}: “${shorten(p.content)}”`,
        platform,
        timestamp: p.scheduledAt,
      })
    } else if (p.status === 'failed') {
      items.push({
        id: `fail-${p.id}`,
        type: 'failed',
        message: `Failed on ${label}: “${shorten(p.content)}”`,
        platform,
        timestamp: p.scheduledAt ?? p.publishedAt ?? new Date().toISOString(),
      })
    }
  }
  for (const a of accounts) {
    if (a.connected && a.lastSync) {
      items.push({
        id: `acc-${a.id}`,
        type: 'connected',
        message: `${platformConfig[a.platform].label} synced: ${a.followers.toLocaleString()} followers`,
        platform: a.platform,
        timestamp: a.lastSync,
      })
    }
  }
  return items
    .filter((i) => new Date(i.timestamp).getTime() <= Date.now() + 60_000 || i.type === 'scheduled')
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit)
}
