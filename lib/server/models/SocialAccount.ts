import { PLATFORMS, type Platform } from '../../platforms'
import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose'

export interface ISocialAccount extends Document {
  platform: Platform
  name: string
  handle: string
  connected: boolean
  followers: number
  lastSync: Date | null
  avatar: string
  accessToken?: string | null // encrypted (lib/server/crypto.ts)
  refreshToken?: string | null
  tokenExpiresAt?: Date
  connectedBy: Types.ObjectId
  externalAccountId: string | null
  profileUrl: string
  postsCount: number | null
  recentEngagement: { posts: number; likes: number; comments: number; shares: number }
  lastSyncError: string | null
}

const socialAccountSchema = new Schema<ISocialAccount>(
  {
    platform: { type: String, enum: PLATFORMS, required: true },
    name: { type: String, required: true },
    handle: { type: String, default: '' },
    connected: { type: Boolean, default: false },
    followers: { type: Number, default: 0 },
    lastSync: { type: Date, default: null },
    avatar: { type: String, default: '' },
    accessToken: { type: String, select: false },
    refreshToken: { type: String, select: false },
    tokenExpiresAt: { type: Date, select: false },
    connectedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    externalAccountId: { type: String, default: null },
    profileUrl: { type: String, default: '' },
    postsCount: { type: Number, default: null },
    recentEngagement: {
      posts: { type: Number, default: 0 },
      likes: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
    },
    lastSyncError: { type: String, default: null },
  },
  { timestamps: true },
)

socialAccountSchema.index({ platform: 1 }, { unique: true })

export const SocialAccount: Model<ISocialAccount> =
  mongoose.models.SocialAccount || mongoose.model<ISocialAccount>(
    'SocialAccount',
    socialAccountSchema,
    process.env.MONGODB_COLLECTION || 'social_accounts',
  )
