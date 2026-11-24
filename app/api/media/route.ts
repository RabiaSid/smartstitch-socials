import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/server/db'
import { MediaAsset } from '@/lib/server/models/MediaAsset'
import { requireUser } from '@/lib/server/requireUser'
import { handleApiError } from '@/lib/server/handleApiError'

export async function GET(req: NextRequest) {
  try {
    await requireUser(req)
    await connectDB()

    const { searchParams } = new URL(req.url)
    const folder = searchParams.get('folder')
    const search = searchParams.get('search')

    const filter: Record<string, unknown> = {}
    if (folder && folder !== 'All') filter.folder = folder
    if (search) filter.name = { $regex: search, $options: 'i' }

    const assets = await MediaAsset.find(filter).sort({ createdAt: -1 })
    return NextResponse.json({ success: true, assets })
  } catch (err) {
    return handleApiError(err)
  }
}
