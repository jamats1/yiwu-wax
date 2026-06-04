import { test as base, expect } from "@playwright/test";

/** Cart item shape stored in localStorage by Zustand */
export interface CartStorageItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  currency: string;
  image: null;
  quantity: number;
}

/**
 * Extended test that clears the cart (localStorage) before every test
 * and provides helpers for common e2e operations.
 */
export const test = base.extend<{
  /** Navigate to the first product listed on the homepage */
  firstProductHref: string;
  /** Inject a product into the cart via localStorage (no UI interaction needed) */
  injectCartItem: (item?: Partial<CartStorageItem>) => Promise<void>;
}>({
  // Override page to always start with an empty cart
  page: async ({ page }, use) => {
    await page.addInitScript(() => {
      localStorage.removeItem("cart-storage");
    });
    await use(page);
  },

  firstProductHref: async ({ page }, use) => {
    await page.goto("/");
    const link = page.locator('[data-testid="product-card"] a').first();
    await link.waitFor({ timeout: 10_000 });
    const href = (await link.getAttribute("href")) ?? "/products";
    await use(href);
  },

  injectCartItem: async ({ page }, use) => {
    const inject = async (overrides: Partial<CartStorageItem> = {}) => {
      const item: CartStorageItem = {
        id: "test-prod-id",
        name: "Test Wax Print Fabric",
        slug: "test-wax-print-fabric",
        price: 25.0,
        currency: "USD",
        image: null,
        quantity: 1,
        ...overrides,
      };
      await page.addInitScript((cartItem) => {
        localStorage.setItem(
          "cart-storage",
          JSON.stringify({
            state: { items: [cartItem], isCartTrayOpen: false },
            version: 0,
          }),
        );
      }, item);
    };
    await use(inject);
  },
});

export { expect };
