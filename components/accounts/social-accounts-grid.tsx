'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AlertTriangle, CheckCircle2, Clock, ExternalLink, Loader2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import type { SocialAccount } from '@/lib/types'
import { platformConfig } from '@/lib/platforms'
import { PlatformIcon, platformMeta } from '@/components/platform-icon'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Stagger, StaggerItem } from '@/components/motion'

const OAUTH_MESSAGES: Record<string, string> = {
  meta_denied: 'Facebook login was cancelled.',
  meta_missing_code: 'Facebook did not return a login code. Please try again.',
  meta_bad_state: 'Login session expired. Please try again.',
  meta_no_pages: 'No Facebook Page found on this login. Use an account that manages the SmartStitch Page.',
  meta_failed: 'Could not connect to Meta. Check the app ID/secret and permissions.',
  linkedin_disabled: 'LinkedIn is coming soon.',
}

function formatLastSync(iso: string | null) {
  if (!iso) return 'Never synced'
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.max(0, Math.round(diffMs / 60000))
  if (mins < 60) return `Synced ${mins}m ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `Synced ${hours}h ago`
  return `Synced ${Math.round(hours / 24)}d ago`
}

const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 })

// Facebook and Instagram share one Meta login.
function connectUrl(platform: SocialAccount['platform']) {
  if (platform === 'facebook' || platform === 'instagram') return '/api/social/facebook/connect'
  if (platform === 'linkedin') return '/api/social/linkedin/connect'
  return null
}

export function SocialAccountsGrid({ initialAccounts }: { initialAccounts: SocialAccount[] }) {
  const [accounts, setAccounts] = useState(initialAccounts)
  const [busyId, setBusyId] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Show the result of the OAuth redirect once, then clean the URL.
  useEffect(() => {
    const connected = searchParams.get('connected')
    const error = searchParams.get('error')
    if (!connected && !error) return
    if (connected === 'meta') toast.success('Facebook Page and Instagram connected')
    else if (connected) toast.success(`${platformMeta[connected as SocialAccount['platform']]?.label ?? connected} connected`)
    if (error) toast.error(OAUTH_MESSAGES[error] ?? 'Connection failed')
    router.replace('/accounts')
  }, [searchParams, router])

  function connect(account: SocialAccount) {
    if (!platformConfig[account.platform].enabled) {
      toast(platformConfig[account.platform].disabledNote)
      return
    }
    const url = connectUrl(account.platform)
    if (!url) return toast.error('Connection for this platform is not available yet')
    window.location.href = url
  }

  async function call(id: string, action: 'resync' | 'disconnect') {
    setBusyId(id)
    try {
      const res = await fetch(`/api/social/${id}/${action}`, { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.success) throw new Error(data.message || `${action} failed`)
      router.refresh()
      return data
    } finally {
      setBusyId(null)
    }
  }

  async function resync(account: SocialAccount) {
    try {
      await call(account.id, 'resync')
      toast.success(`${platformMeta[account.platform].label} stats updated`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Sync failed')
    }
  }

  async function disconnect(account: SocialAccount) {
    try {
      await call(account.id, 'disconnect')
      setAccounts((prev) => prev.map((a) => (a.id === account.id ? { ...a, connected: false } : a)))
      toast.success(`Disconnected ${platformMeta[account.platform].label}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Disconnect failed')
    }
  }

  // Keep in step with server data after router.refresh().
  useEffect(() => setAccounts(initialAccounts), [initialAccounts])

  return (
    <Stagger className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {accounts.map((account) => {
        const enabled = platformConfig[account.platform].enabled
        const busy = busyId === account.id
        const isPlaceholder = account.id.startsWith('placeholder-')
        const eng = account.recentEngagement
        return (
          <StaggerItem key={account.id}>
            <Card className={enabled ? 'overflow-hidden' : 'overflow-hidden opacity-70'}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-3">
                  {account.avatar && account.connected ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={account.avatar}
                      alt=""
                      className="size-11 rounded-xl object-cover ring-1 ring-border"
                    />
                  ) : (
                    <span
                      className="flex size-11 items-center justify-center rounded-xl"
                      style={{ backgroundColor: `${platformMeta[account.platform].color}1a` }}
                    >
                      <PlatformIcon platform={account.platform} className="size-5" />
                    </span>
                  )}
                  <div>
                    <p className="flex items-center gap-1.5 text-sm font-semibold">
                      {account.avatar && account.connected && (
                        <PlatformIcon platform={account.platform} className="size-3.5" />
                      )}
                      {platformMeta[account.platform].label}
                    </p>
                    {account.profileUrl && account.connected ? (
                      <a
                        href={account.profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                      >
                        {account.handle}
                        <ExternalLink className="size-3" />
                      </a>
                    ) : (
                      <p className="text-xs text-muted-foreground">{account.handle || '—'}</p>
                    )}
                  </div>
                </div>
                {!enabled ? (
                  <Badge variant="secondary" className="gap-1">
                    <Clock className="size-3" /> Coming soon
                  </Badge>
                ) : account.connected ? (
                  <Badge className="gap-1 bg-success/10 text-success hover:bg-success/10">
                    <CheckCircle2 className="size-3" /> Connected
                  </Badge>
                ) : (
                  <Badge variant="secondary">Not connected</Badge>
                )}
              </CardHeader>

              <CardContent className="flex flex-col gap-1">
                {!enabled ? (
                  <p className="text-sm text-muted-foreground">{platformConfig[account.platform].disabledNote}.</p>
                ) : account.connected ? (
                  <>
                    <p className="font-serif text-3xl font-semibold tracking-tight">
                      {account.followers.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      followers
                      {account.postsCount != null && ` · ${account.postsCount.toLocaleString()} posts`}
                    </p>
                    {eng && eng.posts > 0 && (
                      <div className="mt-3 grid grid-cols-3 gap-2 rounded-lg bg-secondary/60 p-2.5 text-center">
                        <div>
                          <p className="text-sm font-semibold">{compact.format(eng.likes)}</p>
                          <p className="text-[11px] text-muted-foreground">Likes</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{compact.format(eng.comments)}</p>
                          <p className="text-[11px] text-muted-foreground">Comments</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold">
                            {account.platform === 'instagram' ? '—' : compact.format(eng.shares)}
                          </p>
                          <p className="text-[11px] text-muted-foreground">Shares</p>
                        </div>
                        <p className="col-span-3 text-[11px] text-muted-foreground">
                          Last {eng.posts} posts
                        </p>
                      </div>
                    )}
                    {account.lastSyncError ? (
                      <p className="mt-2 flex items-start gap-1.5 text-xs text-destructive">
                        <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                        {account.lastSyncError}
                      </p>
                    ) : (
                      <p className="mt-2 text-xs text-muted-foreground">{formatLastSync(account.lastSync)}</p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {account.platform === 'instagram'
                      ? 'Connects through Facebook. The Instagram account must be a Business/Creator account linked to the SmartStitch Page.'
                      : 'Connect to pull live followers and post engagement.'}
                  </p>
                )}
              </CardContent>

              <CardFooter className="flex gap-2">
                {!enabled ? (
                  <Button size="sm" variant="outline" className="w-full" disabled>
                    Coming soon
                  </Button>
                ) : account.connected && !isPlaceholder ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      disabled={busy}
                      onClick={() => resync(account)}
                    >
                      {busy ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
                      Resync
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-destructive"
                      disabled={busy}
                      onClick={() => disconnect(account)}
                    >
                      Disconnect
                    </Button>
                  </>
                ) : (
                  <Button size="sm" className="w-full" onClick={() => connect(account)}>
                    {account.platform === 'instagram' ? 'Connect via Facebook' : `Connect ${platformMeta[account.platform].label}`}
                  </Button>
                )}
              </CardFooter>
            </Card>
          </StaggerItem>
        )
      })}
    </Stagger>
  )
}
