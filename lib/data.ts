import type {
  ActivityItem,
  MediaAsset,
  Post,
  SocialAccount,
  StatCard,
} from './types'

// ---------------------------------------------------------------------------
// Dummy JSON data. Replace these exports with API calls to a MERN backend
// (e.g. `await fetch('/api/posts')`) without touching the UI components.
// ---------------------------------------------------------------------------

export const currentUser = {
  name: 'Amara Bello',
  role: 'Brand Manager',
  email: 'amara@smartstitch.online',
  company: 'Smart Stitch',
  avatar: '/avatars/amara.png',
  initials: 'AB',
}

export const statCards: StatCard[] = [
  { label: 'Scheduled Posts', value: 48, delta: 12.5, trend: 'up' },
  { label: 'Published Posts', value: 312, delta: 8.2, trend: 'up' },
  { label: 'Drafts', value: 17, delta: 3.1, trend: 'down' },
  { label: 'Failed Posts', value: 2, delta: 1.4, trend: 'down' },
]

export const posts: Post[] = [
  {
    id: 'p1',
    content:
      'Introducing the Autumn Atelier collection — hand-finished tailoring in warm camel and midnight wool. Available this Friday. #SmartStitch #AutumnAtelier',
    platforms: ['instagram', 'facebook'],
    status: 'scheduled',
    scheduledAt: '2026-08-07T14:00:00.000Z',
    publishedAt: null,
    media: ['m1'],
    author: 'Amara Bello',
  },
  {
    id: 'p2',
    content:
      'Behind the seams: a look at the craftsmanship that defines every Smart Stitch piece. Precision, patience, permanence.',
    platforms: ['linkedin', 'instagram'],
    status: 'published',
    scheduledAt: '2026-08-02T09:30:00.000Z',
    publishedAt: '2026-08-02T09:30:00.000Z',
    media: ['m2'],
    author: 'Amara Bello',
    engagement: { likes: 1284, comments: 96, shares: 41 },
  },
  {
    id: 'p3',
    content:
      'The little black blazer, reimagined. Structured shoulders, softened lines. Which styling do you prefer?',
    platforms: ['instagram'],
    status: 'draft',
    scheduledAt: null,
    publishedAt: null,
    media: ['m3'],
    author: 'Amara Bello',
  },
  {
    id: 'p4',
    content:
      'Weekend edit: five ways to wear our signature trench. Save this for later.',
    platforms: ['facebook', 'instagram', 'linkedin'],
    status: 'scheduled',
    scheduledAt: '2026-08-09T11:00:00.000Z',
    publishedAt: null,
    media: ['m4'],
    author: 'Amara Bello',
  },
  {
    id: 'p5',
    content:
      'Our Milan pop-up opens next week. Reserve a private fitting appointment through the link in bio.',
    platforms: ['instagram', 'linkedin'],
    status: 'failed',
    scheduledAt: '2026-08-01T16:00:00.000Z',
    publishedAt: null,
    media: [],
    author: 'Amara Bello',
  },
  {
    id: 'p6',
    content:
      'Thank you for making our Spring showcase unforgettable. Here is a glimpse of the evening.',
    platforms: ['facebook'],
    status: 'published',
    scheduledAt: '2026-07-28T18:00:00.000Z',
    publishedAt: '2026-07-28T18:00:00.000Z',
    media: ['m5'],
    author: 'Amara Bello',
    engagement: { likes: 842, comments: 54, shares: 22 },
  },
  {
    id: 'p7',
    content:
      'Sustainable luxury is not a trend — it is our standard. Discover the fabrics behind the fall line.',
    platforms: ['linkedin'],
    status: 'scheduled',
    scheduledAt: '2026-08-08T13:30:00.000Z',
    publishedAt: null,
    media: ['m6'],
    author: 'Amara Bello',
  },
  {
    id: 'p8',
    content:
      'New arrivals just dropped. Cashmere knits in six timeless tones.',
    platforms: ['instagram', 'facebook'],
    status: 'draft',
    scheduledAt: null,
    publishedAt: null,
    media: [],
    author: 'Amara Bello',
  },
  {
    id: 'p9',
    content:
      'A tailored suit is an investment in yourself. Book your made-to-measure consultation today.',
    platforms: ['linkedin', 'facebook'],
    status: 'published',
    scheduledAt: '2026-07-25T10:00:00.000Z',
    publishedAt: '2026-07-25T10:00:00.000Z',
    media: ['m7'],
    author: 'Amara Bello',
    engagement: { likes: 610, comments: 38, shares: 19 },
  },
  {
    id: 'p10',
    content:
      'Golden hour, golden thread. Our signature detailing catches the light like nothing else.',
    platforms: ['instagram'],
    status: 'scheduled',
    scheduledAt: '2026-08-10T17:00:00.000Z',
    publishedAt: null,
    media: ['m8'],
    author: 'Amara Bello',
  },
  {
    id: 'p11',
    content:
      'Meet the artisans of Smart Stitch — a short film on the hands behind the label.',
    platforms: ['facebook', 'linkedin'],
    status: 'draft',
    scheduledAt: null,
    publishedAt: null,
    media: ['m9'],
    author: 'Amara Bello',
  },
  {
    id: 'p12',
    content:
      'Limited restock: the best-selling silk scarf returns in three new colourways.',
    platforms: ['instagram', 'facebook'],
    status: 'published',
    scheduledAt: '2026-07-20T12:00:00.000Z',
    publishedAt: '2026-07-20T12:00:00.000Z',
    media: ['m10'],
    author: 'Amara Bello',
    engagement: { likes: 1520, comments: 132, shares: 67 },
  },
]

export const activity: ActivityItem[] = [
  {
    id: 'a1',
    type: 'published',
    message: 'Autumn campaign teaser published to Instagram',
    platform: 'instagram',
    timestamp: '2026-08-05T08:12:00.000Z',
  },
  {
    id: 'a2',
    type: 'scheduled',
    message: 'Weekend trench edit scheduled for Aug 9',
    platform: 'facebook',
    timestamp: '2026-08-05T07:45:00.000Z',
  },
  {
    id: 'a3',
    type: 'comment',
    message: '96 new comments on “Behind the seams”',
    platform: 'instagram',
    timestamp: '2026-08-04T19:20:00.000Z',
  },
  {
    id: 'a4',
    type: 'failed',
    message: 'Milan pop-up post failed — token expired',
    platform: 'instagram',
    timestamp: '2026-08-04T16:02:00.000Z',
  },
  {
    id: 'a5',
    type: 'draft',
    message: 'New draft saved: “Cashmere knits”',
    timestamp: '2026-08-04T11:30:00.000Z',
  },
  {
    id: 'a6',
    type: 'connected',
    message: 'LinkedIn company page reconnected',
    platform: 'linkedin',
    timestamp: '2026-08-03T14:15:00.000Z',
  },
]

export const socialAccounts: SocialAccount[] = [
  {
    id: 's1',
    platform: 'instagram',
    name: 'Smart Stitch',
    handle: '@smartstitch',
    connected: true,
    followers: 48200,
    lastSync: '2026-08-05T08:00:00.000Z',
    avatar: '/avatars/instagram.png',
  },
  {
    id: 's2',
    platform: 'facebook',
    name: 'Smart Stitch Official',
    handle: '/smartstitch',
    connected: true,
    followers: 32750,
    lastSync: '2026-08-05T07:30:00.000Z',
    avatar: '/avatars/facebook.png',
  },
  {
    id: 's3',
    platform: 'linkedin',
    name: 'Smart Stitch',
    handle: 'company/smartstitch',
    connected: false,
    followers: 12400,
    lastSync: null,
    avatar: '/avatars/linkedin.png',
  },
  {
    id: 's4',
    platform: 'tiktok',
    name: 'Smart Stitch',
    handle: '@smartstitch',
    connected: false,
    followers: 0,
    lastSync: null,
    avatar: '/avatars/tiktok.png',
  },
]

export const mediaAssets: MediaAsset[] = [
  { id: 'm1', name: 'autumn-atelier-01.jpg', type: 'image', url: '/media/autumn-atelier.png', size: '2.4 MB', folder: 'Campaigns', uploadedAt: '2026-08-01T10:00:00.000Z' },
  { id: 'm2', name: 'behind-the-seams.jpg', type: 'image', url: '/media/behind-the-seams.png', size: '3.1 MB', folder: 'Editorial', uploadedAt: '2026-07-30T10:00:00.000Z' },
  { id: 'm3', name: 'black-blazer.jpg', type: 'image', url: '/media/black-blazer.png', size: '1.9 MB', folder: 'Products', uploadedAt: '2026-07-29T10:00:00.000Z' },
  { id: 'm4', name: 'signature-trench.jpg', type: 'image', url: '/media/signature-trench.png', size: '2.7 MB', folder: 'Products', uploadedAt: '2026-07-28T10:00:00.000Z' },
  { id: 'm5', name: 'spring-showcase.mp4', type: 'video', url: '/media/spring-showcase.png', size: '18.2 MB', folder: 'Events', uploadedAt: '2026-07-27T10:00:00.000Z' },
  { id: 'm6', name: 'fall-fabrics.jpg', type: 'image', url: '/media/fall-fabrics.png', size: '2.2 MB', folder: 'Editorial', uploadedAt: '2026-07-26T10:00:00.000Z' },
  { id: 'm7', name: 'made-to-measure.jpg', type: 'image', url: '/media/made-to-measure.png', size: '2.9 MB', folder: 'Products', uploadedAt: '2026-07-25T10:00:00.000Z' },
  { id: 'm8', name: 'golden-thread.jpg', type: 'image', url: '/media/golden-thread.png', size: '2.0 MB', folder: 'Campaigns', uploadedAt: '2026-07-24T10:00:00.000Z' },
  { id: 'm9', name: 'artisans-film.mp4', type: 'video', url: '/media/artisans.png', size: '42.6 MB', folder: 'Editorial', uploadedAt: '2026-07-23T10:00:00.000Z' },
  { id: 'm10', name: 'silk-scarf.jpg', type: 'image', url: '/media/silk-scarf.png', size: '1.6 MB', folder: 'Products', uploadedAt: '2026-07-22T10:00:00.000Z' },
  { id: 'm11', name: 'lookbook-cover.jpg', type: 'image', url: '/media/lookbook.png', size: '3.4 MB', folder: 'Campaigns', uploadedAt: '2026-07-21T10:00:00.000Z' },
  { id: 'm12', name: 'store-milan.jpg', type: 'image', url: '/media/store-milan.png', size: '2.8 MB', folder: 'Events', uploadedAt: '2026-07-20T10:00:00.000Z' },
]

export const mediaFolders = ['All', 'Campaigns', 'Products', 'Editorial', 'Events']

export function getMediaById(id: string): MediaAsset | undefined {
  return mediaAssets.find((m) => m.id === id)
}

// Analytics
export const engagementByDay = [
  { day: 'Mon', instagram: 420, facebook: 240, linkedin: 140 },
  { day: 'Tue', instagram: 510, facebook: 300, linkedin: 180 },
  { day: 'Wed', instagram: 620, facebook: 280, linkedin: 210 },
  { day: 'Thu', instagram: 580, facebook: 360, linkedin: 240 },
  { day: 'Fri', instagram: 720, facebook: 420, linkedin: 300 },
  { day: 'Sat', instagram: 890, facebook: 510, linkedin: 260 },
  { day: 'Sun', instagram: 760, facebook: 460, linkedin: 220 },
]

export const platformDistribution = [
  { platform: 'Instagram', value: 48, key: 'instagram' },
  { platform: 'Facebook', value: 33, key: 'facebook' },
  { platform: 'LinkedIn', value: 19, key: 'linkedin' },
]

export const postsPublishedTrend = [
  { month: 'Feb', posts: 42 },
  { month: 'Mar', posts: 58 },
  { month: 'Apr', posts: 51 },
  { month: 'May', posts: 67 },
  { month: 'Jun', posts: 74 },
  { month: 'Jul', posts: 88 },
]

export const timezones = [
  'Asia/Karachi',
  'Asia/Dubai',
  'Europe/London',
  'America/New_York',
  'America/Los_Angeles',
  'UTC',
  'Europe/Paris',
  'Asia/Tokyo',
]

export const analyticsStats: StatCard[] = [
  { label: 'Posts Published', value: 312, delta: 8.2, trend: 'up' },
  { label: 'Total Engagement', value: 48920, delta: 14.6, trend: 'up' },
  { label: 'Avg. Reach', value: 21400, delta: 5.3, trend: 'up' },
  { label: 'Success Rate', value: 98, delta: 0.6, trend: 'up' },
]
