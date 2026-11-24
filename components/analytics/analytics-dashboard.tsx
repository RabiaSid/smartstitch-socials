'use client'

import { BarChart3, CheckCircle2, ExternalLink, Heart, Send } from 'lucide-react'
import { Cell, Line, LineChart, Pie, PieChart, XAxis, YAxis, CartesianGrid } from 'recharts'
import type { StatCard as StatCardType } from '@/lib/types'
import { StatCard } from '@/components/dashboard/stat-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { PlatformIcon, platformMeta } from '@/components/platform-icon'
import type { TopPost } from '@/lib/server/dashboard'
import { Stagger, StaggerItem, FadeIn } from '@/components/motion'

const icons = [Send, Heart, BarChart3, CheckCircle2]

const trendConfig = {
  posts: { label: 'Posts published', color: 'var(--gold)' },
  engagement: { label: 'Engagement', color: 'var(--chart-3)' },
} satisfies ChartConfig

const distributionConfig = {
  instagram: { label: 'Instagram', color: 'var(--chart-1)' },
  facebook: { label: 'Facebook', color: 'var(--chart-2)' },
  linkedin: { label: 'LinkedIn', color: 'var(--chart-3)' },
  tiktok: { label: 'TikTok', color: 'var(--chart-4)' },
} satisfies ChartConfig

export function AnalyticsDashboard({
  stats,
  trend,
  distribution,
  top,
}: {
  stats: (StatCardType & { hint?: string })[]
  trend: { month: string; posts: number; engagement: number }[]
  distribution: { platform: string; value: number; key: string; count: number }[]
  top: TopPost[]
}) {
  return (
    <div className="flex flex-col gap-6">
      <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <StaggerItem key={stat.label}>
            <StatCard stat={stat} icon={icons[i % icons.length]} format={stat.label === 'Success Rate' ? 'percent' : 'number'} />
          </StaggerItem>
        ))}
      </Stagger>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <FadeIn delay={0.1} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-xl">Recent performance</CardTitle>
              <CardDescription>Posts published (gold) and their engagement (blue), last six months</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={trendConfig} className="h-[280px] w-full">
                <LineChart data={trend} margin={{ left: 4, right: 12, top: 8 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                  <YAxis yAxisId="posts" tickLine={false} axisLine={false} tickMargin={8} width={32} allowDecimals={false} className="text-xs" />
                  <YAxis yAxisId="eng" orientation="right" tickLine={false} axisLine={false} tickMargin={8} width={40} allowDecimals={false} className="text-xs" />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <Line
                    yAxisId="eng"
                    dataKey="engagement"
                    type="monotone"
                    stroke="var(--color-engagement)"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                  <Line
                    yAxisId="posts"
                    dataKey="posts"
                    type="monotone"
                    stroke="var(--color-posts)"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: 'var(--color-posts)' }}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.15}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="font-serif text-xl">Platform distribution</CardTitle>
              <CardDescription>Share of posts by channel</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              {distribution.length === 0 && (
                <p className="py-16 text-center text-sm text-muted-foreground">No published posts yet. Resync your accounts.</p>
              )}
              <ChartContainer config={distributionConfig} className="mx-auto aspect-square h-[220px]">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent nameKey="platform" />} />
                  <Pie data={distribution} dataKey="value" nameKey="platform" innerRadius={55} outerRadius={85} strokeWidth={2}>
                    {distribution.map((entry) => (
                      <Cell
                        key={entry.key}
                        fill={platformMeta[entry.key as keyof typeof platformMeta]?.color ?? 'var(--gold)'}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
              <div className="grid w-full grid-cols-1 gap-2">
                {distribution.map((entry) => (
                  <div key={entry.key} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className="size-2.5 rounded-full"
                        style={{ backgroundColor: platformMeta[entry.key as keyof typeof platformMeta]?.color }}
                      />
                      {entry.platform}
                    </div>
                    <span className="font-medium">
                      {entry.value}% <span className="text-xs font-normal text-muted-foreground">({entry.count})</span>
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      <FadeIn delay={0.2}>
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-xl">Top posts</CardTitle>
            <CardDescription>Highest likes + comments + shares</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col divide-y">
            {top.length === 0 && <p className="text-sm text-muted-foreground">No published posts yet.</p>}
            {top.map((p, i) => (
              <div key={p.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                <span className="w-5 text-center font-serif text-lg font-semibold text-gold">{i + 1}</span>
                {p.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.image} alt="" className="size-12 shrink-0 rounded-lg object-cover ring-1 ring-border" />
                ) : (
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-secondary">
                    <PlatformIcon platform={p.platform} />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-medium">{p.content}</p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <PlatformIcon platform={p.platform} className="size-3.5" />
                    {new Date(p.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{p.engagement.toLocaleString()}</p>
                  <p className="text-[11px] text-muted-foreground">engagement</p>
                </div>
                {p.permalink && (
                  <a href={p.permalink} target="_blank" rel="noopener noreferrer" aria-label="Open post" className="text-muted-foreground hover:text-foreground">
                    <ExternalLink className="size-4" />
                  </a>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  )
}