import { createHash } from "node:crypto";

const OBJECT_ID_RE = /^[a-f0-9]{24}$/i;

/** Strict ObjectId check (mongoose's isValidObjectId also accepts any 12-char string). */
export function isObjectId(value: unknown): value is string {
  return typeof value === "string" && OBJECT_ID_RE.test(value);
}

/**
 * Returns the first key that could act as a MongoDB operator or path
 * ("$where", "a.b"), searching nested objects and arrays. null when clean.
 */
export function findOperatorKey(value: unknown, depth = 0): string | null {
  if (depth > 20 || value === null || typeof value !== "object") return null;
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findOperatorKey(item, depth + 1);
      if (found) return found;
    }
    return null;
  }
  for (const [key, nested] of Object.entries(value)) {
    if (key.startsWith("$") || key.includes(".") || key === "__proto__" || key === "constructor") return key;
    const found = findOperatorKey(nested, depth + 1);
    if (found) return found;
  }
  return null;
}

export function sha256(input: string | Uint8Array): string {
  return createHash("sha256").update(input).digest("hex");
}

/** Best-effort client IP. On Vercel x-forwarded-for is set by the platform. */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return headers.get("x-real-ip")?.trim() || "unknown";
}

/** Same-origin check for state-changing route handlers (defense in depth on top of SameSite). */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
