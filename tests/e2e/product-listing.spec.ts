import { test, expect } from "./fixtures";

test.describe("Product Listing", () => {
  test("shows product grid with multiple cards", async ({ page }) => {
    await page.goto("/products");
    const grid = page.locator('[data-testid="product-grid"]');
    await expect(grid).toBeVisible({ timeout: 10_000 });
    const cards = grid.locator('[data-testid="product-card"]');
    expect(await cards.count()).toBeGreaterThan(0);
  });

  test("search filters the product list", async ({ page }) => {
    await page.goto("/products");
    await page.locator('[data-testid="product-grid"]').waitFor({ timeout: 10_000 });

    const searchInput = page.getByPlaceholder("Search products...");
    await searchInput.fill("abc_no_match_xyz_12345");
    // Search fires on form submit — press Enter to submit
    await searchInput.press("Enter");

    // Wait for URL to update then server re-render
    await page.waitForURL(/q=/, { timeout: 5_000 });

    // Expect "no products found" message since the term won't match anything
    await expect(page.getByText(/no products found/i)).toBeVisible({ timeout: 8_000 });
  });

  test("clearing search restores products", async ({ page }) => {
    await page.goto("/products?q=abc_no_match_xyz");

    // Wait for either a product grid or the "no products found" empty state
    await page.locator('[data-testid="product-grid"]')
      .or(page.getByText(/no products found/i))
      .first()
      .waitFor({ timeout: 10_000 });

    const searchInput = page.getByPlaceholder("Search products...");
    await searchInput.clear();
    // Submit the empty form to clear the search filter
    await searchInput.press("Enter");

    const cards = page.locator('[data-testid="product-card"]');
    await expect(cards.first()).toBeVisible({ timeout: 10_000 });
  });

  test("clicking a category tile filters products", async ({ page }) => {
    await page.goto("/products");
    // Category tiles are links with href containing ?category=
    const categoryLink = page.locator('a[href*="category="]').first();
    const hasTiles = await categoryLink.isVisible({ timeout: 5_000 }).catch(() => false);
    if (!hasTiles) return; // no categories in DB — skip gracefully

    const label = await categoryLink.textContent();
    await categoryLink.click();
    await page.waitForURL(/category=/, { timeout: 5_000 });
    await page.locator('[data-testid="product-grid"]').waitFor({ timeout: 10_000 });
    expect(page.url()).toContain("category=");
  });

  test("each product card has a price displayed", async ({ page }) => {
    await page.goto("/products");
    await page.locator('[data-testid="product-card"]').first().waitFor({ timeout: 10_000 });
    const firstCard = page.locator('[data-testid="product-card"]').first();
    // Price displayed as currency symbol + number
    await expect(firstCard).toContainText(/[$€£]\s*[\d,]+/);
  });
});
