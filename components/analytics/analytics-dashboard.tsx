'use client'

import { BarChart3, CheckCircle2, Heart, Send } from 'lucide-react'
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
import { platformMeta } from '@/components/platform-icon'
import { Stagger, StaggerItem, FadeIn } from '@/components/motion'

const icons = [Send, Heart, BarChart3, CheckCircle2]

const trendConfig = {
  posts: { label: 'Posts published', color: 'var(--gold)' },
} satisfies ChartConfig

const distributionConfig = {
  instagram: { label: 'Instagram', color: 'var(--chart-1)' },
  facebook: { label: 'Facebook', color: 'var(--chart-2)' },
  linkedin: { label: 'LinkedIn', color: 'var(--chart-3)' },
} satisfies ChartConfig

export function AnalyticsDashboard({
  stats,
  trend,
  distribution,
}: {
  stats: StatCardType[]
  trend: { month: string; posts: number }[]
  distribution: { platform: string; value: number; key: string }[]
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
              <CardDescription>Posts published per month over the last six months</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={trendConfig} className="h-[280px] w-full">
                <LineChart data={trend} margin={{ left: 4, right: 12, top: 8 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} width={32} className="text-xs" />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <Line
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
                    <span className="font-medium">{entry.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </div>
  )
}
