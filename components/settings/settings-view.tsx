'use client'

import { useState } from 'react'
import { useTheme } from 'next-themes'
import { AlertTriangle, Copy, Eye, EyeOff, KeyRound, Moon, Sun, Monitor } from 'lucide-react'
import { toast } from 'sonner'
import { timezones } from '@/lib/data'
import { useRouter } from 'next/navigation'
import { useCurrentUser } from '@/components/user-provider'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

export function SettingsView() {
  const { theme, setTheme } = useTheme()
  const currentUser = useCurrentUser()
  const router = useRouter()
  const [name, setName] = useState(currentUser.name)
  const [email, setEmail] = useState(currentUser.email)
  const [company, setCompany] = useState(currentUser.company)
  const [timezone, setTimezone] = useState(currentUser.timezone || 'Asia/Karachi')
  const [showPassword, setShowPassword] = useState(false)
  const [notifications, setNotifications] = useState(currentUser.notificationSettings)
  const [confirmText, setConfirmText] = useState('')
  const [saving, setSaving] = useState<string | null>(null)

  async function send(key: string, url: string, body: unknown, okMessage: string) {
    setSaving(key)
    try {
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || data.success === false) throw new Error(data.message || 'Could not save')
      toast.success(okMessage)
      router.refresh() // updates name/initials in the sidebar and top bar
      return true
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save')
      return false
    } finally {
      setSaving(null)
    }
  }

  function saveProfile() {
    send('profile', '/api/users/profile', { name, email }, 'Profile updated')
  }

  function saveCompany() {
    send('company', '/api/users/profile', { company, timezone }, 'Company details updated')
  }

  async function updatePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    const ok = await send(
      'password',
      '/api/users/password',
      { currentPassword: fd.get('currentPassword'), newPassword: fd.get('newPassword') },
      'Password updated',
    )
    if (ok) form.reset()
  }

  function toggleNotification(key: keyof typeof notifications, checked: boolean) {
    setNotifications((prev) => ({ ...prev, [key]: checked }))
    send('notifications', '/api/users/notifications', { [key]: checked }, 'Notification preference saved')
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-xl">Profile</CardTitle>
          <CardDescription>Your personal account details.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="name" className="mb-1.5 block text-sm">Full name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="email" className="mb-1.5 block text-sm">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Button onClick={saveProfile} disabled={saving === 'profile'}>Save profile</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-xl">Company & timezone</CardTitle>
          <CardDescription>Used across scheduling and reports.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="company" className="mb-1.5 block text-sm">Company</Label>
            <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} />
          </div>
          <div>
            <Label className="mb-1.5 block text-sm">Default timezone</Label>
            <Select value={timezone} onValueChange={(v) => v && setTimezone(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timezones.map((tz) => (
                  <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Button onClick={saveCompany} disabled={saving === 'company'}>Save changes</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-xl">Appearance</CardTitle>
          <CardDescription>Choose how Smart Stitch Socials looks on this device.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {[
            { value: 'light', label: 'Light', icon: Sun },
            { value: 'dark', label: 'Dark', icon: Moon },
            { value: 'system', label: 'System', icon: Monitor },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTheme(opt.value)}
              className={cn(
                'flex flex-1 flex-col items-center gap-2 rounded-xl border p-4 text-sm font-medium transition-colors sm:flex-none sm:w-32',
                theme === opt.value
                  ? 'border-primary bg-secondary'
                  : 'border-border hover:bg-secondary/50',
              )}
            >
              <opt.icon className="size-5" />
              {opt.label}
            </button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-xl">Password</CardTitle>
          <CardDescription>Update the password used to sign in.</CardDescription>
        </CardHeader>
        <form onSubmit={updatePassword}>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="current-password" className="mb-1.5 block text-sm">Current password</Label>
              <Input id="current-password" name="currentPassword" type="password" autoComplete="current-password" required />
            </div>
            <div>
              <Label htmlFor="new-password" className="mb-1.5 block text-sm">New password</Label>
              <div className="relative">
                <Input id="new-password" name="newPassword" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required minLength={8} />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Button type="submit" disabled={saving === 'password'}>Update password</Button>
          </CardFooter>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-xl">Notifications</CardTitle>
          <CardDescription>Choose what Smart Stitch emails you about.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col divide-y">
          {[
            { key: 'emailOnPublish', label: 'Post published', description: 'Get an email when a post goes live.' },
            { key: 'emailOnFailure', label: 'Publishing failures', description: 'Get an email if a post fails to publish.' },
            { key: 'weeklyDigest', label: 'Weekly digest', description: 'A weekly summary of performance across channels.' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
              <Switch
                checked={notifications[item.key as keyof typeof notifications]}
                onCheckedChange={(checked) =>
                  toggleNotification(item.key as keyof typeof notifications, checked)
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-serif text-xl text-destructive">
            <AlertTriangle className="size-5" />
            Danger zone
          </CardTitle>
          <CardDescription>Irreversible actions — proceed with care.</CardDescription>
        </CardHeader>
        <CardFooter>
          <Dialog>
            <DialogTrigger
              render={<Button variant="outline" className="border-destructive text-destructive hover:bg-destructive/10" />}
            >
              Delete account
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete your account</DialogTitle>
                <DialogDescription>
                  This permanently removes your profile, posts, and connected accounts. This cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <Label htmlFor="confirm" className="text-sm">Type DELETE to confirm</Label>
              <Input id="confirm" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} />
              <DialogFooter>
                <Button
                  variant="outline"
                  className="border-destructive text-destructive hover:bg-destructive/10"
                  disabled={confirmText !== 'DELETE'}
                  onClick={() => toast.error('Account deletion is disabled in this demo')}
                >
                  Confirm delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
    </div>
  )
}
