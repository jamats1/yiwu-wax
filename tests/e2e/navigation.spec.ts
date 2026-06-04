import { test, expect } from "./fixtures";

test.describe("Navigation & static pages", () => {
  test("logo navigates to home", async ({ page }) => {
    await page.goto("/faq");
    await page.getByRole("link", { name: /Yiwu Wax/i }).first().click();
    await expect(page).toHaveURL("/");
  });

  test("FAQ link in header navigates correctly", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /faq/i }).first().click();
    await page.waitForURL(/\/faq/, { timeout: 5_000 });
    await expect(page.locator("h1, h2").first()).toBeVisible({ timeout: 5_000 });
  });

  test("Contact link navigates correctly", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /contact/i }).first().click();
    await page.waitForURL(/\/contact/, { timeout: 5_000 });
    await expect(page).toHaveURL(/\/contact/);
  });

  test("cart button opens tray when clicked", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /open cart/i }).click();
    const tray = page.getByRole("dialog", { name: /shopping basket/i });
    await expect(tray).toBeVisible({ timeout: 3_000 });
  });

  test("cart tray can be dismissed with Escape", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /open cart/i }).click();
    await page.getByRole("dialog", { name: /shopping basket/i }).waitFor({ timeout: 3_000 });
    await page.keyboard.press("Escape");
    await expect(
      page.getByRole("dialog", { name: /shopping basket/i }),
    ).not.toBeVisible({ timeout: 3_000 });
  });

  const staticPages = [
    { path: "/faq", heading: /faq|frequently/i },
    { path: "/contact", heading: /get in touch|contact/i },
    { path: "/shipping", heading: /shipping/i },
    { path: "/terms", heading: /terms/i },
    { path: "/privacy", heading: /privacy/i },
  ] as const;

  for (const { path, heading } of staticPages) {
    test(`${path} loads and has a visible heading`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
      await expect(
        page.getByRole("heading", { name: heading }).first(),
      ).toBeVisible({ timeout: 8_000 });
    });
  }

  test("404 page renders for unknown route", async ({ page }) => {
    const res = await page.goto("/this-route-does-not-exist-xyz");
    expect(res?.status()).toBe(404);
    await expect(page.getByText(/not found|404/i).first()).toBeVisible({ timeout: 5_000 });
  });

  test("robots.txt is accessible", async ({ request }) => {
    const res = await request.get("/robots.txt");
    expect(res.status()).toBe(200);
  });

  test("sitemap.xml is accessible and contains product URLs", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain("<urlset");
    expect(body).toContain("/products/");
  });
});
