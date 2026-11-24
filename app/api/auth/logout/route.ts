import { NextRequest, NextResponse } from 'next/server'
import { COOKIE_NAME } from '@/lib/server/jwt'

export async function POST() {
  const res = NextResponse.json({ success: true, message: 'Logged out' })
  res.cookies.delete(COOKIE_NAME)
  return res
}

// Plain link logout (sidebar / user menu): clear cookie and go to login.
export async function GET(req: NextRequest) {
  const res = NextResponse.redirect(new URL('/login', req.url))
  res.cookies.delete(COOKIE_NAME)
  return res
}
