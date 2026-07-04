import { expect, type Page } from "@playwright/test";

export function uniqueEmail(prefix = "e2e") {
  const stamp = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  return `${prefix}+${stamp}@viralgen-test.dev`;
}

export const TEST_PASSWORD = "TestPass!23456";

/**
 * Sign up a fresh account and land on /dashboard.
 * Assumes Supabase auto-confirm is on (Lovable Cloud dev default).
 */
export async function signUpNewUser(page: Page, name = "E2E User") {
  const email = uniqueEmail();
  await page.goto("/login");
  await page.getByRole("tab", { name: /sign up/i }).click();
  await page.getByLabel(/full name/i).fill(name);
  await page.getByLabel("Email", { exact: true }).nth(0).or(page.locator("#email-s")).first().fill(email);
  await page.locator("#password-s").fill(TEST_PASSWORD);
  await page.getByRole("button", { name: /create account/i }).click();

  // Auto-confirm on → session established → app redirects. If not,
  // fall back to signing in with the same credentials.
  const dashboard = page.waitForURL(/\/dashboard/, { timeout: 15_000 }).catch(() => null);
  const stayed = await Promise.race([
    dashboard.then(() => "dashboard" as const),
    page.waitForTimeout(4000).then(() => "still-on-login" as const),
  ]);

  if (stayed === "still-on-login") {
    await page.getByRole("tab", { name: /sign in/i }).click();
    await page.locator("#email").fill(email);
    await page.locator("#password").fill(TEST_PASSWORD);
    await page.getByRole("button", { name: /^sign in$/i }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 15_000 });
  }

  await expect(page).toHaveURL(/\/dashboard/);
  return { email };
}

export async function dismissOnboarding(page: Page) {
  const close = page.getByRole("button", { name: /skip|close|got it|dismiss/i });
  if (await close.first().isVisible().catch(() => false)) {
    await close.first().click().catch(() => {});
  }
}
