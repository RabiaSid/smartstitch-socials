/**
 * Create (or reset the password of) a dashboard user.
 *
 *   node --env-file=.env.local scripts/create-user.mjs <email> <password> "<Full Name>"
 *
 * Needs MONGODB_URI (and optionally MONGODB_DB) in the env file. Passwords are hashed with bcrypt, the same
 * way the User model does it.
 */
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const [email, password, name = 'SmartStitch Admin'] = process.argv.slice(2)

if (!email || !password) {
  console.error('Usage: node --env-file=.env.local scripts/create-user.mjs <email> <password> "<Full Name>"')
  process.exit(1)
}
if (password.length < 8) {
  console.error('Use a password of at least 8 characters.')
  process.exit(1)
}
const uri = process.env.MONGODB_URI || process.env.MONGO_URI
if (!uri) {
  console.error('MONGODB_URI is not set. Pass --env-file=.env.local')
  process.exit(1)
}

await mongoose.connect(uri, { dbName: process.env.MONGODB_DB || 'smartstitch' })
console.log(`Connected to database "${mongoose.connection.name}"`)
const users = mongoose.connection.collection('users')
const hash = await bcrypt.hash(password, 10)
const now = new Date()

const result = await users.updateOne(
  { email: email.toLowerCase().trim() },
  {
    $set: { password: hash, updatedAt: now },
    $setOnInsert: {
      name,
      email: email.toLowerCase().trim(),
      role: 'Admin',
      company: 'SmartStitch',
      avatar: '',
      timezone: 'Asia/Karachi',
      theme: 'system',
      notificationSettings: { emailOnPublish: true, emailOnFailure: true, weeklyDigest: true },
      createdAt: now,
    },
  },
  { upsert: true },
)

console.log(result.upsertedCount ? `Created user ${email}` : `Updated password for ${email}`)
await mongoose.disconnect()
