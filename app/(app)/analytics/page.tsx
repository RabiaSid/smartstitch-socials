import { PageHeader } from '@/components/dashboard/page-header'
import { AnalyticsDashboard } from '@/components/analytics/analytics-dashboard'
import { getAccountsForUI } from '@/lib/server/accounts'
import { getPostsForUI } from '@/lib/server/content'
import { buildAnalytics } from '@/lib/server/dashboard'

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
  const [posts, accounts] = await Promise.all([getPostsForUI(), getAccountsForUI()])
  const data = buildAnalytics(posts, accounts)
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Analytics"
        description="Real publishing performance and engagement from Instagram and Facebook."
      />
      <AnalyticsDashboard {...data} />
    </div>
  )
}