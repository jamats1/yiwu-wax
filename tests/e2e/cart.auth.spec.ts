/**
 * Cart page tests — requires Clerk auth (chromium-auth project).
 * See tests/e2e/auth.setup.ts for setup instructions.
 */
import { test, expect } from "./fixtures";

const CART_ITEM = {
  id: "e2e-test-product-id",
  name: "E2E Test Wax Print Fabric",
  slug: "e2e-test-wax-print",
  price: 29.99,
  currency: "USD",
  image: null,
  quantity: 1,
};

test.describe("Cart page (authenticated)", () => {
  test("shows empty state when cart is empty", async ({ page }) => {
    await page.goto("/cart");
    await expect(page.getByRole("heading", { name: /your basket/i })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/nothing here yet/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /browse fabrics/i })).toBeVisible();
  });

  test("shows cart items injected via localStorage", async ({ injectCartItem, page }) => {
    await injectCartItem(CART_ITEM);
    await page.goto("/cart");
    await expect(page.getByText(CART_ITEM.name)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/\$29\.99/)).toBeVisible();
  });

  test("can increase item quantity", async ({ injectCartItem, page }) => {
    await injectCartItem(CART_ITEM);
    await page.goto("/cart");
    await page.getByText(CART_ITEM.name).waitFor({ timeout: 10_000 });

    const increaseBtn = page.getByRole("button", { name: /increase quantity/i })
      .or(page.locator("button").filter({ hasText: "+" }))
      .first();
    await increaseBtn.click();

    await expect(page.getByText("×2").or(page.getByText("2"))).toBeVisible({ timeout: 3_000 });
  });

  test("can remove item from cart", async ({ injectCartItem, page }) => {
    await injectCartItem(CART_ITEM);
    await page.goto("/cart");
    await page.getByText(CART_ITEM.name).waitFor({ timeout: 10_000 });

    await page.getByRole("button", { name: /remove/i }).first().click();

    // Either the item disappears or the empty state shows
    await expect(
      page.getByText(CART_ITEM.name).or(page.getByText(/nothing here yet/i))
    ).toBeAttached();
    await expect(page.getByText(CART_ITEM.name)).not.toBeVisible({ timeout: 3_000 });
  });

  test("proceed to checkout button is enabled with items", async ({ injectCartItem, page }) => {
    await injectCartItem(CART_ITEM);
    await page.goto("/cart");
    await page.getByText(CART_ITEM.name).waitFor({ timeout: 10_000 });

    const checkoutBtn = page.getByRole("button", { name: /proceed to checkout/i });
    await expect(checkoutBtn).toBeEnabled();
  });

  test("proceed to checkout navigates to /checkout", async ({ injectCartItem, page }) => {
    await injectCartItem(CART_ITEM);
    await page.goto("/cart");
    await page.getByText(CART_ITEM.name).waitFor({ timeout: 10_000 });

    await page.getByRole("button", { name: /proceed to checkout/i }).click();
    await page.waitForURL(/\/checkout/, { timeout: 10_000 });
    expect(page.url()).toContain("/checkout");
  });
});
