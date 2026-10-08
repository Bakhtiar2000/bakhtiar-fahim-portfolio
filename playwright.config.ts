import { defineConfig, devices } from "@playwright/test";

// Tests read ADMIN_EMAIL / ADMIN_PASSWORD / MONGODB_URI from .env.local when present.
try {
  process.loadEnvFile(".env.local");
} catch {}

const PORT = Number(process.env.PORT ?? 3000);
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  // Both clear login rate-limit buckets so a test run never locks you out locally.
  globalSetup: "./tests/global-setup.ts",
  globalTeardown: "./tests/global-setup.ts",
  use: { baseURL, trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] }, testMatch: /public\.spec\.ts/ },
  ],
  webServer: {
    command: "npm run dev",
    url: baseURL,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
