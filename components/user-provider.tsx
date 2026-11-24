'use client'

import { createContext, useContext, type ReactNode } from 'react'
import type { CurrentUser } from '@/lib/types'

const UserContext = createContext<CurrentUser | null>(null)

export function UserProvider({ user, children }: { user: CurrentUser; children: ReactNode }) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>
}

/** The signed-in user. Only use inside the (app) layout. */
export function useCurrentUser(): CurrentUser {
  const user = useContext(UserContext)
  if (!user) throw new Error('useCurrentUser must be used inside <UserProvider>')
  return user
}
