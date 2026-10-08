import mongoose from "mongoose";
import { env } from "./env";

type MongooseCache = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };

const globalForMongoose = globalThis as typeof globalThis & { __mongoose?: MongooseCache };

const cache: MongooseCache = globalForMongoose.__mongoose ?? { conn: null, promise: null };
globalForMongoose.__mongoose = cache;

mongoose.set("strictQuery", true);

/** Connects once per process and reuses the connection (hot reload + serverless safe). */
export async function connectDB(): Promise<typeof mongoose> {
  if (cache.conn && mongoose.connection.readyState === 1) return cache.conn;
  if (!cache.promise) {
    cache.promise = mongoose
      .connect(env().MONGODB_URI, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 8000,
        maxPoolSize: 10,
      })
      .catch((error: unknown) => {
        cache.promise = null;
        throw error;
      });
  }
  cache.conn = await cache.promise;
  return cache.conn;
}
