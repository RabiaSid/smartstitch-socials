import { NextResponse } from 'next/server'
import { AuthError } from './requireUser'

export function handleApiError(err: unknown) {
  if (err instanceof AuthError) {
    return NextResponse.json({ success: false, message: err.message }, { status: err.status })
  }
  const message = err instanceof Error ? err.message : 'Server error'
  console.error('[api]', message)
  return NextResponse.json({ success: false, message }, { status: 400 })
}
