import { Suspense } from 'react'
import { PageHeader } from '@/components/dashboard/page-header'
import { SocialAccountsGrid } from '@/components/accounts/social-accounts-grid'
import { getAccountsForUI } from '@/lib/server/accounts'

export const dynamic = 'force-dynamic'

export default async function SocialAccountsPage() {
  const accounts = await getAccountsForUI()
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Social Accounts"
        description="Live followers and engagement from SmartStitch's connected channels."
      />
      <Suspense>
        <SocialAccountsGrid initialAccounts={accounts} />
      </Suspense>
    </div>
  )
}
