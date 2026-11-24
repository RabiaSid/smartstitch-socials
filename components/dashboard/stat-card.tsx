import {
  ArrowDownRight,
  ArrowUpRight,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import type { StatCard as StatCardType } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function StatCard({
  stat,
  icon: Icon = Sparkles,
  format = 'number',
}: {
  stat: StatCardType & { hint?: string }
  icon?: LucideIcon
  format?: 'number' | 'percent'
}) {
  const positive = stat.trend === 'up'
  const value =
    format === 'percent'
      ? `${stat.value}%`
      : stat.value.toLocaleString()

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-foreground">
            <Icon className="size-5" />
          </span>
          {stat.delta !== null && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium',
              positive
                ? 'bg-success/10 text-success'
                : 'bg-destructive/10 text-destructive',
            )}
          >
            {positive ? (
              <ArrowUpRight className="size-3" />
            ) : (
              <ArrowDownRight className="size-3" />
            )}
            {stat.delta}%
          </span>
          )}
        </div>
        <div className="mt-4">
          <p className="font-serif text-3xl font-semibold tracking-tight">
            {value}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
          {stat.hint && <p className="mt-0.5 text-xs text-muted-foreground/80">{stat.hint}</p>}
        </div>
      </CardContent>
    </Card>
  )
}
