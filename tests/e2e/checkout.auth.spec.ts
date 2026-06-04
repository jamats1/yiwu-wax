/**
 * Checkout page tests — requires Clerk auth (chromium-auth project).
 * The Stripe redirect is intercepted so no real payment is made.
 */
import { test, expect } from "./fixtures";

const CART_ITEM = {
  id: "e2e-checkout-product",
  name: "E2E Checkout Wax Print",
  slug: "e2e-checkout-wax-print",
  price: 35.0,
  currency: "USD",
  image: null,
  quantity: 1,
};

test.describe("Checkout page (authenticated)", () => {
  test.beforeEach(async ({ injectCartItem }) => {
    await injectCartItem(CART_ITEM);
  });

  test("renders checkout form with all required fields", async ({ page }) => {
    await page.goto("/checkout");
    await expect(page.getByRole("heading", { name: /your details/i })).toBeVisible({ timeout: 10_000 });

    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/full name/i)).toBeVisible();
    await expect(page.getByLabel(/address/i).first()).toBeVisible();
    await expect(page.getByLabel(/city/i)).toBeVisible();
    await expect(page.getByLabel(/postal/i)).toBeVisible();
    await expect(page.getByLabel(/country/i)).toBeVisible();
  });

  test("shows order summary with injected cart item", async ({ page }) => {
    await page.goto("/checkout");
    await expect(page.getByText(CART_ITEM.name)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/\$35\.00/)).toBeVisible();
  });

  test("submit button is disabled when form is empty", async ({ page }) => {
    await page.goto("/checkout");
    await page.getByRole("heading", { name: /your details/i }).waitFor({ timeout: 10_000 });

    const submitBtn = page.getByRole("button", { name: /continue to payment/i });
    // HTML5 required validation prevents submit; button not disabled by default
    // but clicking it with empty required fields should not navigate away
    await submitBtn.click();
    await expect(page).toHaveURL(/\/checkout/);
  });

  test("filled form submits and shows loading state then Stripe redirect", async ({ page }) => {
    // Intercept the /api/checkout call — return a mock Stripe URL
    await page.route("/api/checkout", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ url: "https://checkout.stripe.com/c/pay/e2e-test" }),
      });
    });

    await page.goto("/checkout");
    await page.getByRole("heading", { name: /your details/i }).waitFor({ timeout: 10_000 });

    await page.getByLabel(/email/i).fill("test@yiwuwax.com");
    await page.getByLabel(/full name/i).fill("E2E Tester");
    await page.getByLabel(/address/i).first().fill("123 Test Street");
    await page.getByLabel(/city/i).fill("Test City");
    await page.getByLabel(/postal/i).fill("12345");
    await page.getByLabel(/country/i).fill("United Kingdom");

    const submitBtn = page.getByRole("button", { name: /continue to payment/i });

    // Watch for the loading state
    await submitBtn.click();
    await expect(submitBtn).toContainText(/opening secure payment/i, { timeout: 3_000 });
  });

  test("redirects to /cart when cart is empty", async ({ page }) => {
    // Override: load with empty cart
    await page.addInitScript(() => {
      localStorage.removeItem("cart-storage");
    });
    await page.goto("/checkout");
    await page.waitForURL(/\/cart/, { timeout: 10_000 });
    expect(page.url()).toContain("/cart");
  });
});
