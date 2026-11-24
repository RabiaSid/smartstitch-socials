// Single source of truth for which social platforms exist and which are live.
// Safe to import from both client components and server code.
//
// A platform that is listed here but not enabled is still SHOWN in the UI
// (composer chips, accounts page) with a "Coming soon" label, but it cannot be
// selected, connected or published to. The API enforces the same rule.
//
// To turn a platform on later, set its env flag to "true" and redeploy:
//   NEXT_PUBLIC_ENABLE_LINKEDIN=true
//   NEXT_PUBLIC_ENABLE_TIKTOK=true
// (NEXT_PUBLIC_ vars are inlined at build time, so a redeploy is required.)

export const PLATFORMS = ['facebook', 'instagram', 'linkedin', 'tiktok'] as const

export type Platform = (typeof PLATFORMS)[number]

export interface PlatformConfig {
  label: string
  enabled: boolean
  /** Shown next to disabled platforms. */
  disabledNote: string
}

export const platformConfig: Record<Platform, PlatformConfig> = {
  facebook: { label: 'Facebook', enabled: true, disabledNote: '' },
  instagram: { label: 'Instagram', enabled: true, disabledNote: '' },
  linkedin: {
    label: 'LinkedIn',
    enabled: process.env.NEXT_PUBLIC_ENABLE_LINKEDIN === 'true',
    disabledNote: 'LinkedIn publishing is coming soon',
  },
  tiktok: {
    label: 'TikTok',
    enabled: process.env.NEXT_PUBLIC_ENABLE_TIKTOK === 'true',
    disabledNote: 'TikTok publishing is coming soon',
  },
}

export function isPlatform(value: unknown): value is Platform {
  return typeof value === 'string' && (PLATFORMS as readonly string[]).includes(value)
}

export function isPlatformEnabled(p: Platform) {
  return platformConfig[p].enabled
}

export const ENABLED_PLATFORMS: Platform[] = PLATFORMS.filter(isPlatformEnabled)

/**
 * Validates a platforms array from a request body.
 * Returns an error message, or null if every platform is known and enabled.
 */
export function validatePlatforms(platforms: unknown): string | null {
  if (!Array.isArray(platforms)) return 'platforms must be an array'
  for (const p of platforms) {
    if (!isPlatform(p)) return `Unknown platform: ${String(p)}`
    if (!isPlatformEnabled(p)) return platformConfig[p].disabledNote
  }
  return null
}
