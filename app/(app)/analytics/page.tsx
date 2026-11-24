import { PageHeader } from '@/components/dashboard/page-header'
import { AnalyticsDashboard } from '@/components/analytics/analytics-dashboard'
import { analyticsStats, postsPublishedTrend, platformDistribution } from '@/lib/data'

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Analytics"
        description="Track publishing performance and engagement across every channel."
      />
      <AnalyticsDashboard
        stats={analyticsStats}
        trend={postsPublishedTrend}
        distribution={platformDistribution}
      />
    </div>
  )
}
