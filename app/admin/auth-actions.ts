"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSession, credentialsMatch, destroySession } from "@/lib/auth/session";
import { clearRateLimit, hitRateLimit, isRateLimited } from "@/lib/rate-limit";
import { clientIp } from "@/lib/security";
import { loginSchema } from "@/lib/validators";

export interface LoginState {
  error: string | null;
}

const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000;
const GENERIC = "Invalid credentials.";

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const ip = clientIp(await headers());

  if (!(await isRateLimited("login", ip, MAX_FAILURES)).allowed) {
    return { error: `${GENERIC} Too many attempts — try again in 15 minutes.` };
  }

  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success || !credentialsMatch(parsed.data.email, parsed.data.password)) {
    await hitRateLimit("login", ip, MAX_FAILURES, WINDOW_MS);
    return { error: GENERIC };
  }

  await clearRateLimit("login", ip);
  await createSession();

  const from = String(formData.get("from") ?? "");
  // Only follow same-site admin paths ("//evil.com" and "/admin.evil" are rejected).
  redirect(/^\/admin(\/[\w-]*)*$/.test(from) ? from : "/admin");
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/admin/login");
}
