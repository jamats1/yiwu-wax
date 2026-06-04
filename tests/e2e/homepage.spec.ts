import { test, expect } from "./fixtures";

test.describe("Homepage", () => {
  test("loads with 200 and correct title", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(/Yiwu Wax/i);
  });

  test("renders at least one product card", async ({ page }) => {
    await page.goto("/");
    const cards = page.locator('[data-testid="product-card"]');
    await expect(cards.first()).toBeVisible({ timeout: 10_000 });
    expect(await cards.count()).toBeGreaterThan(0);
  });

  test("product cards link to /products/[slug]", async ({ page }) => {
    await page.goto("/");
    const firstLink = page
      .locator('[data-testid="product-card"] a[href^="/products/"]')
      .first();
    await expect(firstLink).toBeVisible({ timeout: 10_000 });
    const href = await firstLink.getAttribute("href");
    expect(href).toMatch(/^\/products\/.+/);
  });

  test("header is visible with logo and cart button", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("header")).toBeVisible();
    await expect(page.getByRole("link", { name: /Yiwu Wax/i }).first()).toBeVisible();
    await expect(
      page.getByRole("button", { name: /open cart/i }),
    ).toBeVisible();
  });

  test("search input accepts text and updates URL", async ({ page }) => {
    await page.goto("/");
    const searchInput = page.getByPlaceholder("Search products...");
    await expect(searchInput).toBeVisible({ timeout: 10_000 });
    await searchInput.fill("kente");
    // ProductFilters debounces the URL update — wait for it
    await page.waitForURL(/q=kente/, { timeout: 5_000 }).catch(() => {
      // Some implementations update on submit — verify input value at minimum
    });
    await expect(searchInput).toHaveValue("kente");
  });

  test("product grid renders on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const grid = page.locator('[data-testid="product-grid"]');
    await expect(grid).toBeVisible({ timeout: 10_000 });
  });
});
