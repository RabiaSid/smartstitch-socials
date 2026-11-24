import type { PostStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

const statusStyles: Record<PostStatus, { label: string; className: string; dot: string }> = {
  draft: {
    label: 'Draft',
    className: 'bg-muted text-muted-foreground',
    dot: 'bg-muted-foreground',
  },
  scheduled: {
    label: 'Scheduled',
    className: 'bg-info/10 text-info',
    dot: 'bg-info',
  },
  published: {
    label: 'Published',
    className: 'bg-success/10 text-success',
    dot: 'bg-success',
  },
  failed: {
    label: 'Failed',
    className: 'bg-destructive/10 text-destructive',
    dot: 'bg-destructive',
  },
}

export function StatusBadge({
  status,
  className,
}: {
  status: PostStatus
  className?: string
}) {
  const s = statusStyles[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        s.className,
        className,
      )}
    >
      <span className={cn('size-1.5 rounded-full', s.dot)} aria-hidden="true" />
      {s.label}
    </span>
  )
}
