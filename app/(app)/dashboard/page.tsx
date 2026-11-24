import { PageHeader } from "@/components/dashboard/page-header"
import { StatCard } from "@/components/dashboard/stat-card"
import { EngagementChart } from "@/components/dashboard/engagement-chart"
import { ActivityTimeline } from "@/components/dashboard/activity-timeline"
import { UpcomingPosts } from "@/components/dashboard/upcoming-posts"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { Stagger, StaggerItem, FadeIn } from "@/components/motion"
import { buildActivity, buildStats, buildWeeklyEngagement } from "@/lib/server/dashboard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarClock, Heart, PenLine, Send } from "lucide-react"
import { getCurrentUser } from "@/lib/server/session"
import { AudienceOverview } from "@/components/dashboard/audience-overview"
import { getAccountsForUI } from "@/lib/server/accounts"
import { getPostsForUI } from "@/lib/server/content"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const [accounts, posts, currentUser] = await Promise.all([getAccountsForUI(), getPostsForUI(), getCurrentUser()])
  const stats = buildStats(posts)
  const chart = buildWeeklyEngagement(posts)
  const activity = buildActivity(posts, accounts)
  const statIcons = [Send, Heart, CalendarClock, PenLine]
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={`Welcome back, ${currentUser?.name.split(" ")[0] ?? ""}`}
        description="Here's how your brand is performing across every channel."
      />

      <FadeIn>
        <AudienceOverview accounts={accounts} />
      </FadeIn>

      <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <StaggerItem key={stat.label}>
            <StatCard stat={stat} icon={statIcons[i]} />
          </StaggerItem>
        ))}
      </Stagger>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <FadeIn delay={0.1} className="lg:col-span-2">
          <EngagementChart data={chart.rows} platforms={chart.platforms} />
        </FadeIn>
        <FadeIn delay={0.15} className="h-full">
          <QuickActions />
        </FadeIn>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <FadeIn delay={0.2}>
          <UpcomingPosts posts={posts} />
        </FadeIn>
        <FadeIn delay={0.25}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="font-serif text-xl">Recent activity</CardTitle>
              <CardDescription>Latest posts and account syncs</CardDescription>
            </CardHeader>
            <CardContent>
              {activity.length === 0 ? (
                <p className="text-sm text-muted-foreground">No activity yet. Connect an account or publish a post.</p>
              ) : (
                <ActivityTimeline items={activity} />
              )}
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </div>
  )
}
