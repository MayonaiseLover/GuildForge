import { test, expect } from "@playwright/test";

test.describe("Public Pages", () => {
  test("landing page loads with correct title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/GuildForge/i);
  });

  test("landing page has CTA button", async ({ page }) => {
    await page.goto("/");
    const cta = page.locator('a[href*="login"], a[href*="discord"], button:has-text("Get Started"), button:has-text("Start Building")');
    await expect(cta.first()).toBeVisible();
  });

  test("pricing page loads plans", async ({ page }) => {
    await page.goto("/pricing");
    // Should show at least free/pro tiers
    await expect(page.locator("text=/free|starter|hobby/i").first()).toBeVisible({ timeout: 10_000 });
  });

  test("login page shows Discord OAuth button", async ({ page }) => {
    await page.goto("/login");
    const discordBtn = page.locator('a[href*="discord"], button:has-text("Discord"), a:has-text("Discord")');
    await expect(discordBtn.first()).toBeVisible({ timeout: 10_000 });
  });
});

test.describe("Navigation Guards", () => {
  test("dashboard redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("/dashboard");
    // Should redirect to /login or show auth barrier
    await page.waitForURL(/login|auth|unauthorized/i, { timeout: 10_000 }).catch(() => {});
    const url = page.url();
    const hasAuthGuard =
      url.includes("login") ||
      url.includes("auth") ||
      (await page.locator("text=/sign in|log in|connect.*discord/i").first().isVisible().catch(() => false));
    expect(hasAuthGuard).toBeTruthy();
  });

  test("API returns 401 for unauthenticated requests", async ({ request }) => {
    const resp = await request.get("http://localhost:3001/teams");
    expect(resp.status()).toBe(401);
  });

  test("API health endpoint is publicly accessible", async ({ request }) => {
    const resp = await request.get("http://localhost:3001/health");
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(body.status).toBe("healthy");
  });
});

test.describe("API Metrics", () => {
  test("metrics endpoint returns Prometheus format", async ({ request }) => {
    // Hit health to generate at least one metric
    await request.get("http://localhost:3001/health");

    const resp = await request.get("http://localhost:3001/metrics");
    expect(resp.status()).toBe(200);
    const text = await resp.text();
    expect(text).toContain("http_requests_total");
    expect(text).toContain("http_request_duration_seconds");
    expect(text).toContain("process_resident_memory_bytes");
  });
});

test.describe("Error Handling", () => {
  test("404 page renders for unknown routes", async ({ page }) => {
    const resp = await page.goto("/this-page-does-not-exist-12345");
    // Next.js returns 404 for unknown routes
    expect(resp?.status()).toBe(404);
  });
});
