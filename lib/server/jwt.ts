import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET as string
export const COOKIE_NAME = process.env.JWT_COOKIE_NAME || 'ss_token'

export function generateToken(userId: string) {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'],
  })
}

export function verifyToken(token: string): { id: string } {
  return jwt.verify(token, JWT_SECRET) as { id: string }
}

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60, // seconds
  path: '/',
}
