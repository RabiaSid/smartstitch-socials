/**
 * Standalone scheduler worker for self-hosted deployments (VPS, Docker, etc.)
 * where you can run a second long-lived process alongside `next start`.
 *
 * It does NOT touch the database directly — it just calls the app's own
 * /api/cron/publish endpoint every minute, so the publishing logic stays
 * in one place (lib/server/services/publisher.ts).
 *
 * Usage:
 *   node scripts/cron-worker.js
 *
 * Requires APP_URL and CRON_SECRET to be set (same CRON_SECRET as .env).
 */
const cron = require('node-cron')

const APP_URL = process.env.APP_URL || 'http://localhost:3000'
const CRON_SECRET = process.env.CRON_SECRET

if (!CRON_SECRET) {
  console.error('[cron-worker] CRON_SECRET is not set — refusing to start.')
  process.exit(1)
}

cron.schedule('* * * * *', async () => {
  try {
    const res = await fetch(`${APP_URL}/api/cron/publish`, {
      method: 'POST',
      headers: { 'x-cron-secret': CRON_SECRET },
    })
    const data = await res.json()
    if (data.published > 0) {
      console.log(`[cron-worker] Published ${data.published} due post(s)`)
    }
  } catch (err) {
    console.error('[cron-worker] Failed to reach /api/cron/publish:', err.message)
  }
})

console.log(`[cron-worker] Watching ${APP_URL} — checking for due posts every minute`)
