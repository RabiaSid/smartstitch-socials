import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { AppSidebar } from '@/components/dashboard/app-sidebar'
import { TopNav } from '@/components/dashboard/top-nav'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { UserProvider } from '@/components/user-provider'
import { getCurrentUser } from '@/lib/server/session'

export const dynamic = 'force-dynamic'

// Soft brand backdrop behind every dashboard page (same language as login,
// toned down so data stays readable). CSS lives in globals.css.
function AppBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div className="app-glow app-glow-a" />
      <div className="app-glow app-glow-b" />
      <div className="app-grid absolute inset-0" />
      <svg className="absolute inset-x-0 top-24 h-64 w-full" preserveAspectRatio="none" viewBox="0 0 1440 260">
        <path className="app-stitch" d="M-40 200 C 280 80, 560 260, 860 140 S 1280 40, 1480 120" />
      </svg>
    </div>
  )
}

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser()
  // Invalid/expired cookie: clear it and go to login.
  if (!user) redirect('/api/auth/logout')

  return (
    <UserProvider user={user}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="app-shell">
          <AppBackdrop />
          <TopNav />
          <div className="relative z-10 flex-1 px-4 py-6 md:px-6 md:py-8">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </UserProvider>
  )
}
