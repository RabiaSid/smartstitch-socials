const GRAPH_URL = 'https://graph.facebook.com/v19.0'

export async function publishToInstagram({
  igUserId,
  accessToken,
  caption,
  mediaUrl,
}: {
  igUserId: string
  accessToken: string
  caption: string
  mediaUrl?: string
}) {
  if (!mediaUrl) {
    throw new Error('Instagram requires an image or video URL to publish')
  }

  const createParams = new URLSearchParams({
    image_url: mediaUrl,
    caption: caption || '',
    access_token: accessToken,
  })
  const createRes = await fetch(`${GRAPH_URL}/${igUserId}/media?${createParams.toString()}`, {
    method: 'POST',
  })
  const createData = await createRes.json()
  if (!createRes.ok) {
    throw new Error(createData?.error?.message || 'Failed to create Instagram media container')
  }

  const publishParams = new URLSearchParams({
    creation_id: createData.id,
    access_token: accessToken,
  })
  const publishRes = await fetch(`${GRAPH_URL}/${igUserId}/media_publish?${publishParams.toString()}`, {
    method: 'POST',
  })
  const publishData = await publishRes.json()
  if (!publishRes.ok) {
    throw new Error(publishData?.error?.message || 'Failed to publish Instagram media')
  }

  return { platformPostId: publishData.id }
}
