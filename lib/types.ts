// Shared domain types. These mirror what a MERN backend would return,
// so swapping dummy data for real API calls later is a drop-in change.

import type { Platform } from '@/lib/platforms'

export type { Platform }

export type PostStatus = 'draft' | 'scheduled' | 'published' | 'failed'

export interface Post {
  id: string
  content: string
  platforms: Platform[]
  status: PostStatus
  scheduledAt: string | null // ISO string
  publishedAt: string | null
  media: string[] // media asset ids or urls
  author: string
  engagement?: {
    likes: number
    comments: number
    shares: number
  }
  /** Link to the live post on the platform. */
  permalink?: string | null
  /** 'imported' = pulled from Instagram/Facebook history. */
  source?: 'dashboard' | 'imported'
}

export interface MediaAsset {
  id: string
  name: string
  type: 'image' | 'video'
  url: string
  size: string
  folder: string
  uploadedAt: string
  permalink?: string | null
}

export interface CurrentUser {
  id: string
  name: string
  email: string
  role: string
  company: string
  avatar: string
  timezone: string
  initials: string
  notificationSettings: { emailOnPublish: boolean; emailOnFailure: boolean; weeklyDigest: boolean }
}

export interface SocialAccount {
  id: string
  platform: Platform
  name: string
  handle: string
  connected: boolean
  followers: number
  lastSync: string | null
  avatar: string
  profileUrl?: string
  postsCount?: number | null
  recentEngagement?: { posts: number; likes: number; comments: number; shares: number }
  lastSyncError?: string | null
}

export interface ActivityItem {
  id: string
  type: 'published' | 'scheduled' | 'draft' | 'failed' | 'connected' | 'comment'
  message: string
  platform?: Platform
  timestamp: string
}

export interface StatCard {
  label: string
  value: number
  delta: number | null // percentage change vs previous period; null = no comparison
  trend: 'up' | 'down'
}
