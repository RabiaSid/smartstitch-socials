import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/server/db'
import { MediaAsset } from '@/lib/server/models/MediaAsset'
import cloudinary from '@/lib/server/cloudinary'
import { requireUser } from '@/lib/server/requireUser'
import { handleApiError } from '@/lib/server/handleApiError'

const ALLOWED = /jpeg|jpg|png|webp|gif|mp4|mov|webm/
const MAX_SIZE = 100 * 1024 * 1024 // 100MB

function uploadBufferToCloudinary(buffer: Buffer, resourceType: 'image' | 'video') {
  return new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'smartstitch-socials', resource_type: resourceType },
      (err, result) => (err || !result ? reject(err) : resolve(result as any)),
    )
    stream.end(buffer)
  })
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(req)
    await connectDB()

    const formData = await req.formData()
    const files = formData.getAll('files') as File[]
    const folder = (formData.get('folder') as string) || 'Uncategorized'

    if (!files.length) {
      return NextResponse.json({ success: false, message: 'No files were uploaded' }, { status: 400 })
    }

    const uploaded = await Promise.all(
      files.map(async (file) => {
        const ext = file.name.split('.').pop()?.toLowerCase() || ''
        if (!ALLOWED.test(ext)) {
          throw new Error(`Unsupported file type: ${file.name}`)
        }
        if (file.size > MAX_SIZE) {
          throw new Error(`${file.name} exceeds the 100MB limit`)
        }

        const resourceType = file.type.startsWith('video') ? 'video' : 'image'
        const buffer = Buffer.from(await file.arrayBuffer())
        const result = await uploadBufferToCloudinary(buffer, resourceType)

        return MediaAsset.create({
          name: file.name,
          type: resourceType,
          url: result.secure_url,
          cloudinaryPublicId: result.public_id,
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          bytes: file.size,
          folder,
          uploadedBy: user._id,
        })
      }),
    )

    return NextResponse.json({ success: true, assets: uploaded }, { status: 201 })
  } catch (err) {
    return handleApiError(err)
  }
}
