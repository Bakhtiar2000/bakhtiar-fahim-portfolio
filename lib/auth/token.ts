import { SignJWT, jwtVerify } from "jose";

/**
 * Session tokens. Kept free of Node-only and DB imports so proxy.ts can use it.
 *
 * The signing key is SHA-256(ADMIN_EMAIL:ADMIN_PASSWORD:salt). Changing either
 * credential in env changes the key, which invalidates every existing session.
 */
export const SESSION_COOKIE = "admin_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

const SALT = "bakhtiar-fahim-portfolio/admin-session/v1";
const ISSUER = "portfolio-admin";

let keyCache: { source: string; key: Uint8Array } | null = null;

async function signingKey(): Promise<Uint8Array> {
  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set");
  const source = `${email.toLowerCase()}:${password}:${SALT}`;
  if (keyCache?.source === source) return keyCache.key;
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(source));
  keyCache = { source, key: new Uint8Array(digest) };
  return keyCache.key;
}

export async function signSessionToken(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject("admin")
    .setIssuer(ISSUER)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(await signingKey());
}

/** True only for an unexpired token signed with the current credentials. */
export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, await signingKey(), { issuer: ISSUER, algorithms: ["HS256"] });
    return payload.sub === "admin" && payload.role === "admin";
  } catch {
    return false;
  }
}
