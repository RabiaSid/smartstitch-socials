import { PageHeader } from '@/components/dashboard/page-header'
import { PostCalendar } from '@/components/calendar/post-calendar'
import { FadeIn } from '@/components/motion'
import { getPostsForUI } from '@/lib/server/content'

export const dynamic = 'force-dynamic'

export default async function CalendarPage() {
  const posts = await getPostsForUI()
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Calendar"
        description="Scheduled, published and drafted posts across every channel, including past posts."
      />
      <FadeIn>
        <PostCalendar posts={posts} />
      </FadeIn>
    </div>
  )
}
