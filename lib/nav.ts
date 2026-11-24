import {
  BarChart3,
  CalendarDays,
  Images,
  LayoutDashboard,
  Link2,
  Settings,
  SquarePen,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  title: string
  href: string
  icon: LucideIcon
}

export const navItems: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Posts', href: '/posts', icon: SquarePen },
  { title: 'Calendar', href: '/calendar', icon: CalendarDays },
  { title: 'Media Library', href: '/media', icon: Images },
  { title: 'Analytics', href: '/analytics', icon: BarChart3 },
  { title: 'Social Accounts', href: '/accounts', icon: Link2 },
  { title: 'Settings', href: '/settings', icon: Settings },
]
