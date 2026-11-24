import Link from 'next/link'
import { CalendarPlus, Link2, SquarePen, Upload } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const actions = [
  {
    title: 'Create New Post',
    description: 'Compose across channels',
    href: '/create',
    icon: SquarePen,
    featured: true,
  },
  {
    title: 'Schedule Post',
    description: 'Pick a date & time',
    href: '/calendar',
    icon: CalendarPlus,
  },
  {
    title: 'Upload Media',
    description: 'Add to your library',
    href: '/media',
    icon: Upload,
  },
  {
    title: 'Connect Account',
    description: 'Link a new channel',
    href: '/accounts',
    icon: Link2,
  },
]

export function QuickActions() {
  return (
    <div className="grid h-full grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
      {actions.map((action) => (
        <Card
          key={action.title}
          className={cn(
            'group relative overflow-hidden p-4 transition-all hover:-translate-y-0.5 hover:shadow-md',
            action.featured &&
              'bg-primary text-primary-foreground hover:bg-primary/95',
          )}
        >
          <Link href={action.href} className="flex h-full flex-col justify-between gap-4">
            <span
              className={cn(
                'flex size-10 items-center justify-center rounded-xl transition-transform group-hover:scale-105',
                action.featured
                  ? 'bg-gold text-gold-foreground'
                  : 'bg-secondary text-foreground',
              )}
            >
              <action.icon className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold leading-tight">
                {action.title}
              </p>
              <p
                className={cn(
                  'mt-0.5 text-xs',
                  action.featured
                    ? 'text-primary-foreground/70'
                    : 'text-muted-foreground',
                )}
              >
                {action.description}
              </p>
            </div>
          </Link>
        </Card>
      ))}
    </div>
  )
}
