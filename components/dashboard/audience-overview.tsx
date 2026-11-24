import Link from 'next/link'
import { Users } from 'lucide-react'
import type { SocialAccount } from '@/lib/types'
import { platformConfig } from '@/lib/platforms'
import { PlatformIcon, platformMeta } from '@/components/platform-icon'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// Live audience across connected channels (real numbers from the platform APIs).
export function AudienceOverview({ accounts }: { accounts: SocialAccount[] }) {
  const live = accounts.filter((a) => a.connected && platformConfig[a.platform].enabled)
  const total = live.reduce((sum, a) => sum + a.followers, 0)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="font-serif text-xl">Audience</CardTitle>
        <Button variant="outline" size="sm" render={<Link href="/accounts" />}>
          Manage accounts
        </Button>
      </CardHeader>
      <CardContent>
        {live.length === 0 ? (
          <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed p-5">
            <p className="text-sm text-muted-foreground">
              No channels connected yet. Connect the SmartStitch Facebook Page to see live followers for Facebook and Instagram.
            </p>
            <Button size="sm" render={<Link href="/accounts" />}>
              Connect accounts
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3 sm:min-w-56 sm:border-r sm:pr-6">
              <span className="flex size-11 items-center justify-center rounded-xl bg-gold/15 text-gold">
                <Users className="size-5" />
              </span>
              <div>
                <p className="font-serif text-3xl font-semibold tracking-tight">{total.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total followers</p>
              </div>
            </div>
            <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
              {live.map((a) => (
                <div key={a.id} className="flex items-center gap-3 rounded-lg bg-secondary/60 px-3 py-2.5">
                  <PlatformIcon platform={a.platform} className="size-5" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{platformMeta[a.platform].label}</p>
                    <p className="truncate text-xs text-muted-foreground">{a.handle}</p>
                  </div>
                  <p className="text-sm font-semibold">{a.followers.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
