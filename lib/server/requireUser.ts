import type { NextRequest } from 'next/server'
import { connectDB } from './db'
import { User, type IUser } from './models/User'
import { verifyToken, COOKIE_NAME } from './jwt'

export class AuthError extends Error {
  status: number
  constructor(message: string, status = 401) {
    super(message)
    this.status = status
  }
}

// Reads the JWT from the Authorization header or the auth cookie, verifies
// it, and returns the matching user document. Throws AuthError on failure.
export async function requireUser(req: NextRequest): Promise<IUser> {
  let token: string | undefined

  const authHeader = req.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1]
  } else {
    token = req.cookies.get(COOKIE_NAME)?.value
  }

  if (!token) {
    throw new AuthError('Not authorized — no token provided')
  }

  let decoded: { id: string }
  try {
    decoded = verifyToken(token)
  } catch {
    throw new AuthError('Not authorized — invalid or expired token')
  }

  await connectDB()
  const user = await User.findById(decoded.id)
  if (!user) {
    throw new AuthError('Not authorized — user no longer exists')
  }

  return user
}
