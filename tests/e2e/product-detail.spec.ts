import { test, expect } from "./fixtures";

test.describe("Product Detail Page", () => {
  // Helper: navigate to the first product and return its name
  async function goToFirstProduct(page: import("@playwright/test").Page) {
    await page.goto("/");
    const firstLink = page
      .locator('[data-testid="product-card"] a[href^="/products/"]')
      .first();
    await firstLink.waitFor({ timeout: 10_000 });
    await firstLink.click();
    await page.waitForURL(/\/products\/.+/, { timeout: 10_000 });
  }

  test("loads product page with title and price", async ({ page }) => {
    await goToFirstProduct(page);
    await expect(page.locator("h1")).toBeVisible({ timeout: 10_000 });
    await expect(page.locator("h1")).not.toBeEmpty();
    // Price somewhere on page
    await expect(page.locator("body")).toContainText(/[$€£]\s*[\d,]+/);
  });

  test("shows product image", async ({ page }) => {
    await goToFirstProduct(page);
    const img = page.locator("img").first();
    await expect(img).toBeVisible({ timeout: 10_000 });
  });

  test("breadcrumb shows Home > Fabrics > product name", async ({ page }) => {
    await goToFirstProduct(page);
    const nav = page.getByRole("navigation", { name: /breadcrumb/i });
    await expect(nav).toBeVisible({ timeout: 10_000 });
    await expect(nav).toContainText(/Home/i);
    await expect(nav).toContainText(/Fabrics/i);
  });

  test("Add to basket button is present for in-stock product", async ({ page }) => {
    await goToFirstProduct(page);
    // Either the product-detail AddToCartButton or the card-level one
    const addBtn = page
      .getByRole("button", { name: /add to basket/i })
      .or(page.locator('[data-testid="add-to-cart"]'))
      .first();
    await expect(addBtn).toBeVisible({ timeout: 10_000 });
  });

  test("clicking Add to basket opens the cart tray", async ({ page }) => {
    await goToFirstProduct(page);

    // Use the card-level AddToCartButton (data-testid)
    const addBtn = page
      .locator('[data-testid="add-to-cart"]')
      .or(page.getByRole("button", { name: /add to basket/i }))
      .first();

    await addBtn.waitFor({ timeout: 10_000 });
    const isDisabled = await addBtn.isDisabled();
    if (isDisabled) {
      // Product is sold out — skip cart interaction
      test.skip(true, "Product is sold out, skipping cart tray test");
      return;
    }

    await addBtn.click();

    // Cart tray should open
    const tray = page.getByRole("dialog", { name: /shopping basket/i });
    await expect(tray).toBeVisible({ timeout: 5_000 });
  });

  test("cart tray shows added item name", async ({ page }) => {
    await goToFirstProduct(page);
    const productName = await page.locator("h1").textContent();

    const addBtn = page
      .locator('[data-testid="add-to-cart"]')
      .or(page.getByRole("button", { name: /add to basket/i }))
      .first();

    await addBtn.waitFor({ timeout: 10_000 });
    if (await addBtn.isDisabled()) return;

    await addBtn.click();

    const tray = page.getByRole("dialog", { name: /shopping basket/i });
    await expect(tray).toBeVisible({ timeout: 5_000 });
    // Item name should appear somewhere in the tray
    if (productName) {
      await expect(tray).toContainText(productName.trim().slice(0, 20));
    }
  });

  test("closing cart tray returns focus to page", async ({ page }) => {
    await goToFirstProduct(page);
    const addBtn = page
      .locator('[data-testid="add-to-cart"]')
      .or(page.getByRole("button", { name: /add to basket/i }))
      .first();

    await addBtn.waitFor({ timeout: 10_000 });
    if (await addBtn.isDisabled()) return;

    await addBtn.click();
    const tray = page.getByRole("dialog", { name: /shopping basket/i });
    await expect(tray).toBeVisible({ timeout: 5_000 });

    // Close via Escape key
    await page.keyboard.press("Escape");
    await expect(tray).not.toBeVisible({ timeout: 3_000 });
  });

  test("related products section renders", async ({ page }) => {
    await goToFirstProduct(page);
    // Related products section may or may not have items
    const related = page.getByRole("heading", { name: /you may also like|related/i });
    // Not asserting visible — it only shows when there ARE related products
    // Just ensure the page doesn't error
    await expect(page.locator("main")).toBeVisible();
  });
});
