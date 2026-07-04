import { defineConfig, devices } from "@playwright/test";

/**
 * E2E test config for ViralGen AI.
 *
 * Run against a running dev server (default http://localhost:8080).
 * The suite creates a fresh user per run via email/password sign-up.
 *
 * Prereqs before `bunx playwright test`:
 *   - `bun run dev` in another terminal (or set E2E_BASE_URL)
 *   - Supabase project has email/password auth enabled with auto-confirm
 *     (Lovable Cloud default in dev)
 *
 * One-time (host): `bunx playwright install chromium`
 */
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:8080",
    trace: "retain-on-failure",
    video: "retain-on-failure",
    screenshot: "only-on-failure",
    viewport: { width: 1280, height: 900 },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
