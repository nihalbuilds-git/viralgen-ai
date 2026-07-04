import { test, expect } from "@playwright/test";
import { signUpNewUser, dismissOnboarding } from "./helpers";

/**
 * Single ordered spec that walks the full happy path:
 *   sign up → brand profile → generate caption → persistence (history)
 *   → favorite → toggle public share → open /s/:id anonymously.
 *
 * Ordered because each step depends on state produced by the previous
 * one (same user, same generation row). Splitting would require seeding.
 */
test.describe.configure({ mode: "serial" });

test.describe("ViralGen E2E — full user journey", () => {
  test("sign up + brand profile + generate + favorite + share", async ({ page, context }) => {
    // 1. Sign up ------------------------------------------------------------
    await signUpNewUser(page);
    await dismissOnboarding(page);
    await expect(page).toHaveURL(/\/dashboard/);

    // 2. Brand profile setup -----------------------------------------------
    await page.goto("/dashboard/brand-profiles");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    const createBtn = page.getByRole("button", { name: /new profile|create|add profile/i }).first();
    if (await createBtn.isVisible().catch(() => false)) {
      await createBtn.click();
      await page.getByLabel(/name/i).first().fill("Acme Co");
      const voice = page.getByLabel(/voice|tone|description/i).first();
      if (await voice.isVisible().catch(() => false)) {
        await voice.fill("Bold, playful, direct. Emoji-light. No jargon.");
      }
      await page.getByRole("button", { name: /save|create/i }).first().click();
      await expect(page.getByText(/acme co/i).first()).toBeVisible({ timeout: 10_000 });
    }

    // 3. Generate a caption -------------------------------------------------
    await page.goto("/dashboard/caption");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    const topic = page.getByLabel(/topic|product|about|prompt/i).first();
    await topic.fill("Launch of an AI notebook that summarizes lectures in 30 seconds");

    const generate = page.getByRole("button", { name: /^generate|create caption/i }).first();
    await generate.click();

    // Output surface — wait for generated text to appear
    const output = page.locator('[data-testid="generation-output"], article, pre, .prose').first();
    await expect(output).toBeVisible({ timeout: 45_000 });

    // 4. Persistence — appears in history ----------------------------------
    await page.goto("/dashboard/history");
    const historyItem = page.getByText(/notebook|lecture|30 seconds/i).first();
    await expect(historyItem).toBeVisible({ timeout: 10_000 });

    // 5. Favorite it --------------------------------------------------------
    const favBtn = page.getByRole("button", { name: /favorite/i }).first();
    await favBtn.click();

    await page.goto("/dashboard/favorites");
    await expect(page.getByText(/notebook|lecture|30 seconds/i).first()).toBeVisible({
      timeout: 10_000,
    });

    // 6. Toggle public share + open /s/:id anonymously ---------------------
    await page.goto("/dashboard/history");
    const shareBtn = page.getByRole("button", { name: /^share$/i }).first();
    await shareBtn.click();

    const toggle = page.getByRole("switch", { name: /public|toggle public share/i }).first();
    await toggle.click();

    const shareInput = page.getByLabel(/share url/i);
    await expect(shareInput).toBeVisible({ timeout: 5_000 });
    const url = await shareInput.inputValue();
    expect(url).toMatch(/\/s\/[0-9a-f-]{8,}/i);

    // Open share URL in a fresh (anonymous) context
    const anon = await context.browser()!.newContext();
    const anonPage = await anon.newPage();
    await anonPage.goto(url);
    await expect(anonPage.getByText(/notebook|lecture|30 seconds/i).first()).toBeVisible({
      timeout: 10_000,
    });
    await anon.close();
  });
});
