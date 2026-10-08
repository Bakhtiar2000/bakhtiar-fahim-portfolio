import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// No nonces: keeps the public site statically prerendered. Vercel Analytics is
// served from the same origin (/_vercel/insights), so 'self' covers it.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data:",
  "font-src 'self'",
  "connect-src 'self'",
  "frame-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // SAMEORIGIN (not DENY) so /resume can embed the PDF served by /api/files.
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  cacheLife: {
    // Live Codeforces stats: refresh twice a day.
    halfDay: { stale: 300, revalidate: 60 * 60 * 12, expire: 60 * 60 * 24 * 7 },
  },
  images: {
    localPatterns: [{ pathname: "/api/files/**", search: "" }],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // The PDF viewer is a plugin; keep CSP off the raw file responses.
      { source: "/((?!api/files).*)", headers: [{ key: "Content-Security-Policy", value: csp }] },
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
  },
};

export default nextConfig;
