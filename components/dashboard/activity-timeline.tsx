import {
  CheckCircle2,
  Clock,
  FileText,
  Link2,
  MessageCircle,
  XCircle,
  type LucideIcon,
} from 'lucide-react'
import type { ActivityItem } from '@/lib/types'
import { cn } from '@/lib/utils'

const iconMap: Record<ActivityItem['type'], { icon: LucideIcon; tone: string }> = {
  published: { icon: CheckCircle2, tone: 'bg-success/10 text-success' },
  scheduled: { icon: Clock, tone: 'bg-info/10 text-info' },
  draft: { icon: FileText, tone: 'bg-muted text-muted-foreground' },
  failed: { icon: XCircle, tone: 'bg-destructive/10 text-destructive' },
  connected: { icon: Link2, tone: 'bg-gold/15 text-gold' },
  comment: { icon: MessageCircle, tone: 'bg-secondary text-foreground' },
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const future = diff < 0
  const hours = Math.round(Math.abs(diff) / 3_600_000)
  if (hours < 1) return future ? 'within the hour' : 'just now'
  const text = hours < 24 ? `${hours}h` : `${Math.round(hours / 24)}d`
  return future ? `in ${text}` : `${text} ago`
}

export function ActivityTimeline({ items }: { items: ActivityItem[] }) {
  return (
    <ol className="relative flex flex-col gap-5">
      {items.map((item, index) => {
        const { icon: Icon, tone } = iconMap[item.type]
        const isLast = index === items.length - 1
        return (
          <li key={item.id} className="relative flex gap-3.5">
            {!isLast ? (
              <span className="absolute left-[15px] top-9 h-[calc(100%-4px)] w-px bg-border" />
            ) : null}
            <span
              className={cn(
                'z-10 flex size-8 shrink-0 items-center justify-center rounded-full',
                tone,
              )}
            >
              <Icon className="size-4" />
            </span>
            <div className="min-w-0 pt-1">
              <p className="text-sm leading-snug text-pretty">{item.message}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {timeAgo(item.timestamp)}
              </p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
