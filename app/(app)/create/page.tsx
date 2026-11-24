import { PageHeader } from '@/components/dashboard/page-header'
import { PostComposer } from '@/components/posts/post-composer'

export default function CreatePostPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Create post"
        description="Compose once, publish everywhere — preview each channel before you schedule."
      />
      <PostComposer />
    </div>
  )
}
