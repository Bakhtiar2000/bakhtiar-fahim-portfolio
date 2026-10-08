import { connectDB } from "./db";
import { RateLimit } from "./models";
import { sha256 } from "./security";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

/** Hash identifiers so raw IPs are never stored. */
const bucketKey = (scope: string, id: string) => `${scope}:${sha256(id).slice(0, 32)}`;

async function current(key: string) {
  const now = new Date();
  // The TTL monitor runs about once a minute, so ignore expired buckets explicitly.
  return RateLimit.findOne({ key, expiresAt: { $gt: now } }).lean();
}

/** Read-only check: is this identifier already over the limit? */
export async function isRateLimited(scope: string, id: string, limit: number): Promise<RateLimitResult> {
  await connectDB();
  const doc = await current(bucketKey(scope, id));
  const count = doc?.count ?? 0;
  return { allowed: count < limit, remaining: Math.max(0, limit - count), resetAt: doc?.expiresAt ?? new Date() };
}

/** Records one hit in a fixed window and reports whether it was within the limit. */
export async function hitRateLimit(scope: string, id: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  await connectDB();
  const key = bucketKey(scope, id);
  const now = new Date();
  await RateLimit.deleteOne({ key, expiresAt: { $lte: now } });
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const doc = await RateLimit.findOneAndUpdate(
        { key },
        { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date(now.getTime() + windowMs) } },
        { upsert: true, returnDocument: "after" },
      ).lean();
      const count = doc?.count ?? 1;
      return { allowed: count <= limit, remaining: Math.max(0, limit - count), resetAt: doc?.expiresAt ?? now };
    } catch (error) {
      // Two concurrent upserts can race on the unique key; the retry increments.
      if (attempt === 1 || !(error instanceof Error && "code" in error && error.code === 11000)) throw error;
    }
  }
  return { allowed: false, remaining: 0, resetAt: now };
}

export async function clearRateLimit(scope: string, id: string): Promise<void> {
  await connectDB();
  await RateLimit.deleteOne({ key: bucketKey(scope, id) });
}
