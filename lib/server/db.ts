import mongoose from 'mongoose'

// Shared contract names: MONGODB_URI + MONGODB_DB (MONGO_URI kept as fallback).
const MONGO_URI = (process.env.MONGODB_URI || process.env.MONGO_URI) as string
const DB_NAME = process.env.MONGODB_DB || 'smartstitch'

if (!MONGO_URI) {
  console.warn('[db] MONGODB_URI is not set — API routes that touch the database will fail.')
}

// Next.js reloads modules in dev and reuses lambdas in serverless, so we cache
// the connection promise on the global object to avoid opening a new
// connection on every request / hot reload.
declare global {
  // eslint-disable-next-line no-var
  var _mongooseConn: Promise<typeof mongoose> | undefined
}

export async function connectDB() {
  if (!global._mongooseConn) {
    global._mongooseConn = mongoose.connect(MONGO_URI, {
      dbName: DB_NAME,
      bufferCommands: false,
    })
  }
  return global._mongooseConn
}
