import { Suspense } from 'react'
import { LoginForm } from '@/components/auth/login-form'
import { LogoMark } from '@/components/logo'

// Split-card sign-in on an animated navy backdrop (brand navy #0A1F44 + gold).
// All motion is CSS-only and switches off with prefers-reduced-motion.
export default function LoginPage() {
  return (
    <div className="login-bg relative flex min-h-svh items-center justify-center overflow-hidden px-4 py-10">
      {/* Backdrop: drifting glows, faint thread grid, slow stitch lines */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="login-glow login-glow-a" />
        <div className="login-glow login-glow-b" />
        <div className="login-glow login-glow-c" />
        <div className="login-grid absolute inset-0" />
        <svg className="absolute inset-0 size-full" preserveAspectRatio="none" viewBox="0 0 1440 900">
          <path className="login-stitch" d="M-50 720 C 300 600, 520 860, 820 700 S 1300 560, 1500 640" />
          <path className="login-stitch login-stitch-slow" d="M-50 180 C 260 260, 560 60, 860 170 S 1260 300, 1500 210" />
        </svg>
      </div>

      <div className="login-card relative grid w-full max-w-4xl overflow-hidden rounded-3xl bg-card shadow-2xl shadow-black/40 ring-1 ring-white/10 md:grid-cols-[1.05fr_1fr]">
        {/* Left: brand panel */}
        <div className="login-panel relative hidden overflow-hidden p-10 text-white md:flex md:flex-col">
          <ContourLines />
          <span className="login-float absolute right-10 top-10 text-2xl text-gold/80" aria-hidden="true">+</span>
          <span className="login-float login-float-delay absolute left-14 top-1/3 text-xl text-white/50" aria-hidden="true">+</span>
          <span className="login-float absolute right-24 top-1/2 size-3 rounded-full border border-gold/70" aria-hidden="true" />
          <span className="login-float login-float-delay absolute bottom-12 left-1/2 size-2.5 rounded-full border border-white/50" aria-hidden="true" />
          <div className="login-dots absolute right-8 top-24 h-16 w-10" aria-hidden="true" />

          <div className="relative flex items-center gap-3">
            <LogoMark className="size-11 rounded-xl ring-1 ring-gold/40" />
            <div className="leading-none">
              <p className="font-serif text-lg font-semibold">SmartStitch</p>
              <p className="mt-1 text-[0.7rem] font-medium uppercase tracking-[0.2em] text-gold">Socials</p>
            </div>
          </div>

          <div className="relative mt-auto">
            <h1 className="font-serif text-4xl font-semibold leading-tight">
              Welcome <span className="text-gold">back!</span>
            </h1>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/75">
              Plan, approve and publish SmartStitch content for buyers in the US, UAE and UK, all from one place.
            </p>
            <div className="mt-8 flex gap-2" aria-hidden="true">
              <span className="h-1 w-8 rounded-full bg-gold" />
              <span className="h-1 w-3 rounded-full bg-white/40" />
              <span className="h-1 w-3 rounded-full bg-white/40" />
            </div>
          </div>
        </div>

        {/* Right: form */}
        <div className="flex flex-col justify-center p-8 sm:p-10">
          <div className="mb-8 flex items-center gap-3 md:hidden">
            <LogoMark className="size-10" />
            <div className="leading-none">
              <p className="font-serif text-lg font-semibold">SmartStitch</p>
              <p className="mt-1 text-[0.7rem] font-medium uppercase tracking-[0.2em] text-gold">Socials</p>
            </div>
          </div>
          <h2 className="font-serif text-3xl font-semibold tracking-tight">Sign in</h2>
          <p className="mb-7 mt-1.5 text-sm text-muted-foreground">Use your SmartStitch staff account.</p>
          <Suspense>
            <LoginForm />
          </Suspense>
          <p className="mt-7 text-center text-xs text-muted-foreground">
            Need access?{' '}
            <a href="mailto:smartstitchonline@gmail.com" className="font-medium text-gold hover:underline">
              Contact the admin
            </a>
          </p>
        </div>
      </div>

      <p className="absolute bottom-4 text-xs text-white/50">
        &copy; {new Date().getFullYear()} SmartStitch
      </p>
    </div>
  )
}

function ContourLines() {
  return (
    <svg
      aria-hidden="true"
      className="login-contours absolute -left-24 -top-16 h-[130%] w-[130%] text-white/15"
      viewBox="0 0 400 400"
      fill="none"
    >
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <path
          key={i}
          d={`M ${-20 + i * 6} ${300 - i * 22}
              C ${60 + i * 8} ${220 - i * 18}, ${120 + i * 4} ${360 - i * 20}, ${200 + i * 6} ${260 - i * 16}
              S ${330 + i * 4} ${150 - i * 10}, ${420} ${200 - i * 18}`}
          stroke="currentColor"
          strokeWidth="1"
        />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <ellipse
          key={`e${i}`}
          cx="330"
          cy="330"
          rx={30 + i * 18}
          ry={20 + i * 14}
          stroke="currentColor"
          strokeWidth="1"
          transform="rotate(-20 330 330)"
        />
      ))}
    </svg>
  )
}
