# Smart Stitch Socials

One Next.js project — frontend pages **and** backend API live together, no separate Express server.

## Setup

\`\`\`bash
npm install
cp .env.example .env    # fill in real MongoDB / Cloudinary / JWT / FB / LinkedIn values
npm run dev              # http://localhost:3000 (UI + API together)
\`\`\`

## Structure

\`\`\`
app/
  (app)/dashboard, posts, create, calendar, media, analytics, accounts, settings   ← UI pages
  api/
    auth/          register, login, logout, me
    posts/         list+create, [id] (get/update/delete), bulk-delete, bulk-publish
    media/         list, upload (Cloudinary), [id] delete
    social/        list, facebook/connect+callback, linkedin/connect+callback, [id]/disconnect, [id]/resync
    analytics/     summary, trend, distribution
    users/         profile, password, notifications, me (delete)
    cron/publish/  auto-publishes due scheduled posts (secret-protected)
  login/, not-found.tsx
components/          UI components (per page) + shadcn/ui primitives
lib/
  data.ts, types.ts, nav.ts     ← frontend dummy data (still used by the UI, per the original spec)
  server/
    db.ts                       ← MongoDB connection (cached for dev/serverless)
    jwt.ts, requireUser.ts      ← auth helpers used by every protected route
    cloudinary.ts
    models/                     ← Mongoose models: User, Post, MediaAsset, SocialAccount
    services/                   ← Facebook/Instagram/LinkedIn publishing + publisher.ts
scripts/cron-worker.js          ← optional standalone scheduler for self-hosted deployments
vercel.json                     ← Vercel Cron config (alternative to the worker script)
\`\`\`

## Auth

JWT stored in an httpOnly cookie (`ss_token`) set by `/api/auth/login` and `/api/auth/register`. Every protected route calls `requireUser(req)` from `lib/server/requireUser.ts`, which reads the cookie (or an `Authorization: Bearer` header) and loads the user.

## Media uploads

`POST /api/media/upload` accepts `multipart/form-data` (`files` field, optional `folder`) directly — no extra middleware needed, since Next.js Route Handlers parse `request.formData()` natively. Files are streamed to Cloudinary.

## Scheduled publishing

Next.js API routes are stateless — there's no long-running process to run `node-cron` inside like a traditional Express server. Two ways to trigger `/api/cron/publish` on a schedule:

1. **Deploying on Vercel** — `vercel.json` already defines a cron that hits `/api/cron/publish` every minute. Just set `CRON_SECRET` in your Vercel project env vars; Vercel sends it automatically as `Authorization: Bearer <CRON_SECRET>`.
2. **Self-hosting** (VPS/Docker) — run `npm run cron:worker` as a second process alongside `npm start`. It pings `/api/cron/publish` every minute using `node-cron`, with `CRON_SECRET` sent as the `x-cron-secret` header.

Either way, the actual publishing logic lives in one place: `lib/server/services/publisher.ts`.

## Still TODO before going live

- Complete the Facebook/LinkedIn OAuth token-exchange steps marked `TODO` in `app/api/social/*/callback/route.ts`
- Add request validation (e.g. `zod`) on write routes
- Add automated tests
- Swap the frontend pages from `lib/data.ts` dummy data to real `fetch()` calls against the routes above

## Platform availability (LinkedIn / TikTok)

Platforms are defined in `lib/platforms.ts`. LinkedIn and TikTok are **shown in the UI but disabled** ("Coming soon"): they cannot be selected in the composer, connected on the Accounts page, or published to. The API (`/api/posts`, `/api/social/linkedin/*`, the publisher/cron) enforces the same rule.

To enable later, set the flag and redeploy (these are build-time vars):

```
NEXT_PUBLIC_ENABLE_LINKEDIN=true
NEXT_PUBLIC_ENABLE_TIKTOK=true
```

LinkedIn still needs the OAuth token exchange in `app/api/social/linkedin/callback/route.ts`. TikTok needs a service (Content Posting API, app review) plus connect/callback routes; the publisher currently throws for TikTok.

## Live followers & engagement (Facebook + Instagram)

The Accounts page and the dashboard "Audience" card show **real** data from the Meta Graph API (official API only, no scraping). One Facebook login connects both the SmartStitch Facebook Page and the Instagram Business account linked to it.

Pulled per account: followers, Instagram post count, and likes/comments/shares across the last 25 posts. Stats refresh on connect, on **Resync**, and daily via `/api/cron/sync-stats` (01:00 UTC = 06:00 PKT). A daily snapshot is stored in `accountsnapshots` for growth charts. Meta removed page/post reach metrics in 2026, so reach is not used.

### Setup

1. Create a **Business** app at developers.facebook.com and add **Facebook Login for Business**.
2. Add the redirect URI: `https://social.smartstitch.online/api/social/facebook/callback` (and `http://localhost:3000/api/social/facebook/callback` for dev).
3. Instagram must be a **Business/Creator** account linked to the SmartStitch Facebook Page.
4. Permissions requested: `pages_show_list, pages_read_engagement, pages_manage_posts, business_management, instagram_basic, instagram_content_publish`. They work for app admins/testers right away. Other users need Meta App Review.
5. Env vars:

```
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
FACEBOOK_REDIRECT_URI=https://social.smartstitch.online/api/social/facebook/callback
FACEBOOK_PAGE_ID=            # optional: pick this Page if the login manages several
META_GRAPH_VERSION=v26.0     # optional
TOKEN_ENCRYPTION_KEY=        # node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
CLIENT_URL=https://social.smartstitch.online
CRON_SECRET=
```

Page tokens are stored encrypted (AES-256-GCM).

## Theme

Colors and fonts follow the SmartStitch brand from the shared contract: navy `#0A1F44`, gold `#D4AF37` / `#F1D77A`, blue `#1E5EFF`, ivory background, Fraunces headings and Manrope body (`app/globals.css`, `app/layout.tsx`).

## Login

- The login form calls `/api/auth/login`, which sets the `ss_token` cookie. `proxy.ts` sends signed-out visitors to `/login?next=...`.
- Logout links hit `GET /api/auth/logout` (clears the cookie).
- Registration is closed once one user exists (set `ALLOW_REGISTRATION=true` to reopen).
- Create or reset a user (needs `MONGODB_URI`, `MONGODB_DB` and `JWT_SECRET` in `.env.local`):

```
npm run create-user -- you@smartstitch.online "StrongPass123" "Rabia"
```
