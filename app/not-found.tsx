import Link from 'next/link'
import { Compass } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/logo'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <Logo />
      <span className="flex size-16 items-center justify-center rounded-2xl bg-secondary">
        <Compass className="size-7 text-gold" />
      </span>
      <div className="space-y-2">
        <p className="font-serif text-6xl font-semibold tracking-tight">404</p>
        <h1 className="font-serif text-2xl font-semibold tracking-tight">Page not found</h1>
        <p className="max-w-sm text-sm text-muted-foreground text-pretty">
          The page you're looking for doesn't exist or may have moved. Let's get you back on track.
        </p>
      </div>
      <Button render={<Link href="/dashboard" />}>Back to dashboard</Button>
    </div>
  )
}
