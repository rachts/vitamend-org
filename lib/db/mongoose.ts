import mongoose from "mongoose";
import "server-only";

const MONGODB_URI = process.env.MONGODB_URI;

declare global {
  var __mongooseCache:
    | { conn: typeof import("mongoose") | null; promise: Promise<typeof import("mongoose")> | null }
    | undefined;
}

const cached = global.__mongooseCache ?? (global.__mongooseCache = { conn: null, promise: null });

async function connectMongoose() {
  if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      dbName: process.env.MONGODB_DB_NAME || "vitamend",
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export { connectMongoose };
export default connectMongoose;
