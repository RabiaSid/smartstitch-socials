import { cn } from '@/lib/utils'

// SmartStitch "SS" brand mark (public/brand/ss-logo.png). Also used for the
// favicon and app icons (app/favicon.ico, app/icon.png, app/apple-icon.png).
export function LogoMark({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/ss-logo-192.png"
      alt=""
      aria-hidden="true"
      width={36}
      height={36}
      className={cn('size-9 shrink-0 rounded-[10px]', className)}
    />
  )
}

export function Logo({
  className,
  onDark = false,
}: {
  className?: string
  onDark?: boolean
}) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <LogoMark />
      <div className="flex flex-col leading-none">
        <span
          className={cn(
            'font-serif text-lg font-semibold tracking-tight',
            onDark ? 'text-white' : 'text-foreground',
          )}
        >
          SmartStitch
        </span>
        <span className="text-[0.7rem] font-medium uppercase tracking-[0.18em] text-gold">
          Socials
        </span>
      </div>
    </div>
  )
}
