import mongoose, { Schema, type Document, type Model } from 'mongoose'
import { PLATFORMS, type Platform } from '../../platforms'

// One row per platform per day, so follower growth can be charted over time.
export interface IAccountSnapshot extends Document {
  platform: Platform
  date: string // YYYY-MM-DD (UTC)
  followers: number
  recentLikes: number
  recentComments: number
  recentShares: number
  recentPosts: number
}

const accountSnapshotSchema = new Schema<IAccountSnapshot>(
  {
    platform: { type: String, enum: PLATFORMS, required: true },
    date: { type: String, required: true },
    followers: { type: Number, default: 0 },
    recentLikes: { type: Number, default: 0 },
    recentComments: { type: Number, default: 0 },
    recentShares: { type: Number, default: 0 },
    recentPosts: { type: Number, default: 0 },
  },
  { timestamps: true },
)

accountSnapshotSchema.index({ platform: 1, date: 1 }, { unique: true })

export const AccountSnapshot: Model<IAccountSnapshot> =
  mongoose.models.AccountSnapshot ||
  mongoose.model<IAccountSnapshot>('AccountSnapshot', accountSnapshotSchema, 'social_metrics')
