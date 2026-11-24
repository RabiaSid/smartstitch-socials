const LINKEDIN_API = 'https://api.linkedin.com/v2'

export async function publishToLinkedIn({
  organizationUrn,
  accessToken,
  text,
}: {
  organizationUrn: string
  accessToken: string
  text: string
}) {
  const body = {
    author: organizationUrn,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: { text },
        shareMediaCategory: 'NONE',
      },
    },
    visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
  }

  const res = await fetch(`${LINKEDIN_API}/ugcPosts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify(body),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data?.message || 'Failed to publish to LinkedIn')
  }

  return { platformPostId: res.headers.get('x-restli-id') || data.id }
}
