export async function register() {
  // Fail fast at server startup with a clear message. Skipped during
  // `next build` so the site can still prerender from fallback content.
  if (process.env.NEXT_RUNTIME === "nodejs" && process.env.NEXT_PHASE !== "phase-production-build") {
    const { env } = await import("./lib/env");
    env();
  }
}
