import "server-only";
import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { env } from "../env";
import { sha256 } from "../security";
import { SESSION_COOKIE, SESSION_TTL_SECONDS, signSessionToken, verifySessionToken } from "./token";

/**
 * Constant-time comparison. Both sides are hashed first so the buffers always
 * have equal length and the input length does not leak through timing.
 */
function safeEqual(a: string, b: string): boolean {
  return timingSafeEqual(Buffer.from(sha256(a), "hex"), Buffer.from(sha256(b), "hex"));
}

export function credentialsMatch(email: string, password: string): boolean {
  const { ADMIN_EMAIL, ADMIN_PASSWORD } = env();
  // Evaluate both so a wrong email takes the same time as a wrong password.
  const emailOk = safeEqual(email.trim().toLowerCase(), ADMIN_EMAIL.trim().toLowerCase());
  const passwordOk = safeEqual(password, ADMIN_PASSWORD);
  return emailOk && passwordOk;
}

export async function createSession(): Promise<void> {
  const token = await signSessionToken();
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function destroySession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}

/** Reads and verifies the session cookie. Call in every admin page, action and route. */
export async function isAdmin(): Promise<boolean> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}

export class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized");
    this.name = "UnauthorizedError";
  }
}

export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) throw new UnauthorizedError();
}
