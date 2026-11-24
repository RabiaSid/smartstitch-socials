const GRAPH_URL = 'https://graph.facebook.com/v19.0'

export async function publishToFacebook({
  pageId,
  accessToken,
  message,
  mediaUrl,
}: {
  pageId: string
  accessToken: string
  message: string
  mediaUrl?: string
}) {
  const endpoint = mediaUrl ? `${GRAPH_URL}/${pageId}/photos` : `${GRAPH_URL}/${pageId}/feed`

  const params = new URLSearchParams({
    access_token: accessToken,
    ...(mediaUrl ? { url: mediaUrl, caption: message } : { message }),
  })

  const res = await fetch(`${endpoint}?${params.toString()}`, { method: 'POST' })
  const data = await res.json()

  if (!res.ok) {
    throw new Error(data?.error?.message || 'Failed to publish to Facebook')
  }

  return { platformPostId: data.id || data.post_id }
}
