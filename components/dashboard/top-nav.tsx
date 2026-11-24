'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Bell,
  LogOut,
  Search,
  Settings,
  User,
} from 'lucide-react'
import { navItems } from '@/lib/nav'
import { activity } from '@/lib/data'
import { useCurrentUser } from '@/components/user-provider'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from '@/components/theme-toggle'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

function usePageTitle() {
  const pathname = usePathname()
  if (pathname.startsWith('/create')) return 'Create Post'
  const match = navItems.find((item) =>
    item.href === '/dashboard'
      ? pathname === item.href
      : pathname.startsWith(item.href),
  )
  return match?.title ?? 'Dashboard'
}

export function TopNav() {
  const currentUser = useCurrentUser()
  const title = usePageTitle()

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-md md:px-6">
      <SidebarTrigger className="md:hidden" />
      <div className="flex flex-col">
        <h1 className="font-serif text-lg font-semibold leading-tight tracking-tight md:text-xl">
          {title}
        </h1>
      </div>

      <div className="ml-auto flex items-center gap-1.5 md:gap-2">
        <InputGroup className="hidden w-64 lg:flex">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput placeholder="Search posts, media, accounts..." />
        </InputGroup>

        <Button variant="ghost" size="icon" aria-label="Search" className="lg:hidden">
          <Search />
        </Button>

        <ThemeToggle />

        <Popover>
          <PopoverTrigger
            render={
              <Button variant="ghost" size="icon" aria-label="Notifications" className="relative" />
            }
          >
            <Bell />
            <span className="absolute right-2 top-2 size-2 rounded-full bg-gold ring-2 ring-background" />
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <p className="text-sm font-semibold">Notifications</p>
              <span className="text-xs text-muted-foreground">{activity.length} new</span>
            </div>
            <div className="max-h-80 divide-y overflow-y-auto">
              {activity.map((item) => (
                <div key={item.id} className="flex gap-3 px-4 py-3 hover:bg-muted/50">
                  <span className="mt-1.5 size-2 shrink-0 rounded-full bg-gold" />
                  <div className="min-w-0">
                    <p className="text-sm leading-snug">{item.message}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {new Date(item.timestamp).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t p-2">
              <Button variant="ghost" size="sm" className="w-full">
                Mark all as read
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <Separator orientation="vertical" className="mx-1 hidden h-6 md:block" />

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" className="h-10 gap-2 pl-1.5 pr-2" aria-label="Account menu" />
            }
          >
            <Avatar className="size-7">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
                {currentUser.initials}
              </AvatarFallback>
            </Avatar>
            <span className="hidden text-sm font-medium md:inline">
              {currentUser.name}
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {/* Base UI requires a label to sit inside a Group */}
            <DropdownMenuGroup>
              <DropdownMenuLabel>
                <span className="block text-sm font-medium text-foreground">{currentUser.name}</span>
                <span className="block truncate text-xs font-normal text-muted-foreground">
                  {currentUser.email}
                </span>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem render={<Link href="/settings" />}>
                <User />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href="/settings" />}>
                <Settings />
                Settings
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              render={<a href="/api/auth/logout" />}
            >
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
