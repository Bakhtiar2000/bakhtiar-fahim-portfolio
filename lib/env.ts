import { z } from "zod";

/**
 * The app needs exactly three variables. Everything else is optional and the
 * feature that uses it is skipped when it is missing.
 */
const serverSchema = z.object({
  MONGODB_URI: z
    .string({ error: "MONGODB_URI is missing" })
    .regex(/^mongodb(\+srv)?:\/\//, "MONGODB_URI must start with mongodb:// or mongodb+srv://"),
  ADMIN_EMAIL: z.email({ error: "ADMIN_EMAIL must be a valid email address" }),
  ADMIN_PASSWORD: z.string({ error: "ADMIN_PASSWORD is missing" }).min(12, "ADMIN_PASSWORD must be at least 12 characters"),
  // Optional: email notifications for the contact form.
  RESEND_API_KEY: z.string().min(1).optional(),
  CONTACT_TO_EMAIL: z.email().optional(),
  CONTACT_FROM_EMAIL: z.string().min(3).optional(),
});

export type ServerEnv = z.infer<typeof serverSchema>;

let cached: ServerEnv | null = null;

function blankToUndefined(value: string | undefined) {
  return value && value.trim() !== "" ? value.trim() : undefined;
}

/** Validated server env. Throws a readable error listing every problem. */
export function env(): ServerEnv {
  if (cached) return cached;
  const parsed = serverSchema.safeParse({
    MONGODB_URI: blankToUndefined(process.env.MONGODB_URI),
    ADMIN_EMAIL: blankToUndefined(process.env.ADMIN_EMAIL),
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || undefined,
    RESEND_API_KEY: blankToUndefined(process.env.RESEND_API_KEY),
    CONTACT_TO_EMAIL: blankToUndefined(process.env.CONTACT_TO_EMAIL),
    CONTACT_FROM_EMAIL: blankToUndefined(process.env.CONTACT_FROM_EMAIL),
  });
  if (!parsed.success) {
    const problems = parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`);
    throw new Error(
      `Invalid environment configuration:\n${problems.join("\n")}\n` +
        `Copy .env.example to .env.local and fill in MONGODB_URI, ADMIN_EMAIL and ADMIN_PASSWORD.`,
    );
  }
  cached = parsed.data;
  return cached;
}

/** Public base URL used for canonical links, sitemap and OG tags. */
export function siteUrl(): string {
  const explicit = blankToUndefined(process.env.NEXT_PUBLIC_SITE_URL);
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = blankToUndefined(process.env.VERCEL_PROJECT_PRODUCTION_URL);
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}
