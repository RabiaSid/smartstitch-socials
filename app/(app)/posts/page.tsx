import { PageHeader } from '@/components/dashboard/page-header'
import { PostsTable } from '@/components/posts/posts-table'
import { FadeIn } from '@/components/motion'
import { getPostsForUI } from '@/lib/server/content'

export const dynamic = 'force-dynamic'

export default async function PostsPage() {
  const posts = await getPostsForUI()
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Posts"
        description="Every draft, scheduled and published post, including past posts from Instagram and Facebook."
      />
      <FadeIn>
        <PostsTable initialPosts={posts} />
      </FadeIn>
    </div>
  )
}
