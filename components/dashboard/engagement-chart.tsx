"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart"
import { platformConfig, type Platform } from "@/lib/platforms"

const COLORS: Record<Platform, string> = {
  instagram: "var(--chart-1)",
  facebook: "var(--chart-3)",
  linkedin: "var(--chart-2)",
  tiktok: "var(--chart-4)",
}

export function EngagementChart({
  data,
  platforms,
}: {
  data: Record<string, string | number>[]
  platforms: Platform[]
}) {
  const config = Object.fromEntries(
    platforms.map((p) => [p, { label: platformConfig[p].label, color: COLORS[p] }]),
  ) satisfies ChartConfig
  const hasData = data.some((row) => platforms.some((p) => Number(row[p]) > 0))

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-serif text-xl">Performance overview</CardTitle>
        <CardDescription>Likes, comments and shares per week, by the week a post went live (last 8 weeks)</CardDescription>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex h-[300px] items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
            No published posts in the last 8 weeks yet. Resync your accounts to pull recent posts.
          </div>
        ) : (
          <ChartContainer config={config} className="h-[300px] w-full">
            <AreaChart data={data} margin={{ left: 4, right: 12, top: 8 }}>
              <defs>
                {platforms.map((p) => (
                  <linearGradient key={p} id={`fill-${p}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={`var(--color-${p})`} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={`var(--color-${p})`} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="week" tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} width={40} allowDecimals={false} className="text-xs" />
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
              <ChartLegend content={<ChartLegendContent />} />
              {platforms.map((p) => (
                <Area
                  key={p}
                  dataKey={p}
                  type="monotone"
                  fill={`url(#fill-${p})`}
                  stroke={`var(--color-${p})`}
                  strokeWidth={2}
                />
              ))}
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
