import { PageHeader } from '@/components/dashboard/page-header'
import { MediaLibrary } from '@/components/media/media-library'
import { FadeIn } from '@/components/motion'
import { getMediaForUI } from '@/lib/server/content'

export const dynamic = 'force-dynamic'

export default async function MediaPage() {
  const { assets, folders } = await getMediaForUI()
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Media Library"
        description="Uploads plus every image already posted on SmartStitch's Instagram and Facebook."
      />
      <FadeIn>
        <MediaLibrary initialAssets={assets} folders={folders} />
      </FadeIn>
    </div>
  )
}
