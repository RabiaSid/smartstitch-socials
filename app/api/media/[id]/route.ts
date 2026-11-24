import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/server/db'
import { MediaAsset } from '@/lib/server/models/MediaAsset'
import cloudinary from '@/lib/server/cloudinary'
import { requireUser } from '@/lib/server/requireUser'
import { handleApiError } from '@/lib/server/handleApiError'

type Params = { params: Promise<{ id: string }> }

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    await requireUser(req)
    await connectDB()
    const { id } = await params

    const asset = await MediaAsset.findById(id)
    if (!asset) {
      return NextResponse.json({ success: false, message: 'Media asset not found' }, { status: 404 })
    }

    if (asset.cloudinaryPublicId) {
      await cloudinary.uploader.destroy(asset.cloudinaryPublicId, {
        resource_type: asset.type === 'video' ? 'video' : 'image',
      })
    }

    await asset.deleteOne()
    return NextResponse.json({ success: true, message: 'Media deleted' })
  } catch (err) {
    return handleApiError(err)
  }
}
