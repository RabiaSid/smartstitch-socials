import { cookies } from 'next/headers'
import { connectDB } from './db'
import { User } from './models/User'
import { COOKIE_NAME, verifyToken } from './jwt'
import type { CurrentUser } from '@/lib/types'

// Logged-in user for server components (layout, pages). null if signed out
// or the cookie is invalid/expired.
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value
  if (!token) return null
  let id: string
  try {
    id = verifyToken(token).id
  } catch {
    return null
  }
  await connectDB()
  const u = await User.findById(id).lean()
  if (!u) return null

  const initials =
    u.name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]!.toUpperCase())
      .join('') || 'U'

  return {
    id: String(u._id),
    name: u.name,
    email: u.email,
    role: u.role,
    company: u.company,
    avatar: u.avatar ?? '',
    timezone: u.timezone ?? 'Asia/Karachi',
    initials,
    notificationSettings: {
      emailOnPublish: u.notificationSettings?.emailOnPublish ?? true,
      emailOnFailure: u.notificationSettings?.emailOnFailure ?? true,
      weeklyDigest: u.notificationSettings?.weeklyDigest ?? true,
    },
  }
}
