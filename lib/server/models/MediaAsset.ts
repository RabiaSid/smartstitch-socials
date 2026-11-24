import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose'

export interface IMediaAsset extends Document {
  name: string
  type: 'image' | 'video'
  url: string
  cloudinaryPublicId: string | null
  size: string
  bytes: number
  folder: string
  uploadedBy: Types.ObjectId
  source: 'upload' | 'instagram' | 'facebook'
  externalId: string | null
  permalink: string | null
  postedAt: Date | null
}

const mediaAssetSchema = new Schema<IMediaAsset>(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ['image', 'video'], required: true },
    url: { type: String, required: true },
    cloudinaryPublicId: { type: String, default: null },
    size: { type: String, default: '0 MB' },
    bytes: { type: Number, default: 0 },
    folder: { type: String, default: 'Uncategorized' },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    source: { type: String, enum: ['upload', 'instagram', 'facebook'], default: 'upload' },
    externalId: { type: String, default: null, index: true },
    permalink: { type: String, default: null },
    postedAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: 'uploadedAt', updatedAt: true } },
)

export const MediaAsset: Model<IMediaAsset> =
  mongoose.models.MediaAsset || mongoose.model<IMediaAsset>('MediaAsset', mediaAssetSchema, 'social_assets')
