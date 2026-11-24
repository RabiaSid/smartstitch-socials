import mongoose, { Schema, type Document, type Model } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUser extends Document {
  name: string
  email: string
  password: string
  role: string
  company: string
  avatar: string
  timezone: string
  theme: 'light' | 'dark' | 'system'
  notificationSettings: {
    emailOnPublish: boolean
    emailOnFailure: boolean
    weeklyDigest: boolean
  }
  comparePassword(candidate: string): Promise<boolean>
  toSafeObject(): Record<string, unknown>
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, default: 'Brand Manager' },
    company: { type: String, default: 'Smart Stitch' },
    avatar: { type: String, default: '' },
    timezone: { type: String, default: 'UTC' },
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
    notificationSettings: {
      emailOnPublish: { type: Boolean, default: true },
      emailOnFailure: { type: Boolean, default: true },
      weeklyDigest: { type: Boolean, default: true },
    },
  },
  { timestamps: true },
)

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next()
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

userSchema.methods.comparePassword = function comparePassword(candidate: string) {
  return bcrypt.compare(candidate, this.password)
}

userSchema.methods.toSafeObject = function toSafeObject() {
  const { _id, name, email, role, company, avatar, timezone, theme, notificationSettings } = this
  return { id: _id, name, email, role, company, avatar, timezone, theme, notificationSettings }
}

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema, 'users')
