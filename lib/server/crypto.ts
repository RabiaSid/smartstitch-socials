import crypto from 'crypto'

// AES-256-GCM encryption for OAuth tokens at rest (shared contract: "OAuth
// tokens only, encrypted"). Key: TOKEN_ENCRYPTION_KEY = 32 random bytes,
// base64 encoded. Generate with:
//   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

const PREFIX = 'v1:'

function getKey() {
  const raw = process.env.TOKEN_ENCRYPTION_KEY?.trim().replace(/^['"]|['"]$/g, '')
  if (!raw) throw new Error('TOKEN_ENCRYPTION_KEY is not set')
  const key = Buffer.from(raw, 'base64')
  if (key.length === 32) return key
  // Any other value (a passphrase, hex, a key with a typo) is turned into a
  // 32-byte key with SHA-256. Keep the value fixed once tokens are saved,
  // otherwise stored tokens can no longer be decrypted.
  if (raw.length < 16) throw new Error('TOKEN_ENCRYPTION_KEY is too short (use at least 16 characters)')
  return crypto.createHash('sha256').update(raw).digest()
}

export function encryptToken(plain: string): string {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', getKey(), iv)
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return PREFIX + [iv, tag, enc].map((b) => b.toString('base64')).join('.')
}

export function decryptToken(stored: string | null | undefined): string | null {
  if (!stored) return null
  if (!stored.startsWith(PREFIX)) return stored // legacy plaintext (dev only)
  const [iv, tag, enc] = stored.slice(PREFIX.length).split('.').map((s) => Buffer.from(s, 'base64'))
  const decipher = crypto.createDecipheriv('aes-256-gcm', getKey(), iv)
  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString('utf8')
}
