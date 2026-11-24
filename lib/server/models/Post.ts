import { PLATFORMS, type Platform } from '../../platforms'
import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose'

export interface IPost extends Document {
  content: string
  platforms: Platform[]
  status: 'draft' | 'scheduled' | 'published' | 'failed'
  scheduledAt: Date | null
  publishedAt: Date | null
  media: Types.ObjectId[]
  author: Types.ObjectId
  engagement: { likes: number; comments: number; shares: number }
  failureReason: string | null
  platformPostIds: Record<Platform, string | null>
  permalink: string | null
  source: 'dashboard' | 'imported'
}

const postSchema = new Schema<IPost>(
  {
    content: { type: String, required: true },
    platforms: { type: [String], enum: PLATFORMS, default: [] },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'published', 'failed'],
      default: 'draft',
    },
    scheduledAt: { type: Date, default: null },
    publishedAt: { type: Date, default: null },
    media: [{ type: Schema.Types.ObjectId, ref: 'MediaAsset' }],
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    engagement: {
      likes: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
    },
    failureReason: { type: String, default: null },
    permalink: { type: String, default: null },
    // 'imported' = pulled from the platform (posts made before this dashboard)
    source: { type: String, enum: ['dashboard', 'imported'], default: 'dashboard' },
    platformPostIds: {
      facebook: { type: String, default: null },
      instagram: { type: String, default: null },
      linkedin: { type: String, default: null },
      tiktok: { type: String, default: null },
    },
  },
  { timestamps: true },
)

postSchema.index({ status: 1, scheduledAt: 1 })
postSchema.index({ 'platformPostIds.instagram': 1 }, { sparse: true })
postSchema.index({ 'platformPostIds.facebook': 1 }, { sparse: true })

export const Post: Model<IPost> = mongoose.models.Post || mongoose.model<IPost>('Post', postSchema, 'social_posts')
