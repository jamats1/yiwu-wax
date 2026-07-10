/**
 * Admin dashboard tests — requires Clerk auth (chromium-auth project) with an
 * account listed in ADMIN_CLERK_EMAILS. See tests/e2e/auth.setup.ts.
 *
 * Skipped automatically when TEST_USER_EMAIL / TEST_USER_PASSWORD are not set.
 */
import { test, expect } from "@playwright/test";

test.skip(
  !process.env.TEST_USER_EMAIL || !process.env.TEST_USER_PASSWORD,
  "TEST_USER_EMAIL / TEST_USER_PASSWORD not set",
);

test.describe("Admin dashboard (authenticated admin)", () => {
  test("overview shows KPI cards and live users", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible({
      timeout: 15_000,
    });
    for (const kpi of [
      "Revenue",
      "Orders",
      "Avg Order Value",
      "Conversion",
      "Customers",
      "Product Views",
    ]) {
      await expect(page.getByText(kpi, { exact: true }).first()).toBeVisible();
    }
    await expect(page.getByText(/visitors online/i)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("AI Insights")).toBeVisible();
  });

  test("period selector reloads metrics", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible({
      timeout: 15_000,
    });
    const request = page.waitForRequest((r) =>
      r.url().includes("/api/admin/dashboard?days=7"),
    );
    await page.getByRole("button", { name: "7 days" }).click();
    await request;
  });

  test("sidebar navigates to every section", async ({ page }) => {
    await page.goto("/admin");
    const sections: Array<[string, RegExp]> = [
      ["Products", /admin\/products/],
      ["Orders", /admin\/orders/],
      ["Customers", /admin\/customers/],
      ["Inventory", /admin\/inventory/],
      ["Reviews", /admin\/reviews/],
      ["Analytics", /admin\/analytics/],
      ["Discounts", /admin\/discounts/],
    ];
    for (const [label, url] of sections) {
      await page.getByRole("link", { name: label, exact: true }).click();
      await expect(page).toHaveURL(url);
      await expect(page.getByRole("heading", { name: label })).toBeVisible({
        timeout: 15_000,
      });
    }
  });

  test("products table shows thumbnails, search and filters", async ({ page }) => {
    await page.goto("/admin/products");
    await expect(page.getByRole("heading", { name: "Products" })).toBeVisible({
      timeout: 20_000,
    });

    // Rows render with a thumbnail (img or explicit no-image placeholder)
    const firstRow = page.locator("tbody tr").first();
    await expect(firstRow).toBeVisible({ timeout: 20_000 });
    const thumb = firstRow.locator("img, [title='No image']").first();
    await expect(thumb).toBeVisible();

    // Search narrows the list
    const search = page.getByPlaceholder(/search products/i);
    await search.fill("zzz-no-such-product-zzz");
    await expect(page.getByText(/no products match your filters/i)).toBeVisible();
    await search.clear();
    await expect(page.locator("tbody tr").first()).toBeVisible();
  });

  test("add product modal opens and closes", async ({ page }) => {
    await page.goto("/admin/products");
    await page.getByRole("button", { name: /add product/i }).click();
    await expect(page.getByRole("heading", { name: "New Product" })).toBeVisible();
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByRole("heading", { name: "New Product" })).toBeHidden();
  });

  test("bulk selection reveals the action bar", async ({ page }) => {
    await page.goto("/admin/products");
    const firstRow = page.locator("tbody tr").first();
    await expect(firstRow).toBeVisible({ timeout: 20_000 });
    await firstRow.getByRole("button", { name: /select /i }).click();
    await expect(page.getByText(/1 selected/)).toBeVisible();
    await page.getByRole("button", { name: "Clear" }).click();
    await expect(page.getByText(/1 selected/)).toBeHidden();
  });

  test("orders page shows status filters", async ({ page }) => {
    await page.goto("/admin/orders");
    await expect(page.getByRole("heading", { name: "Orders" })).toBeVisible({
      timeout: 15_000,
    });
    for (const status of ["pending", "paid", "shipped", "delivered", "cancelled"]) {
      await expect(
        page.getByRole("button", { name: new RegExp(`^${status} \\(\\d+\\)$`, "i") }),
      ).toBeVisible();
    }
  });

  test("inventory shows stock KPIs", async ({ page }) => {
    await page.goto("/admin/inventory");
    await expect(page.getByRole("heading", { name: "Inventory" })).toBeVisible({
      timeout: 15_000,
    });
    for (const kpi of ["Total products", "Well stocked", "Low stock", "Out of stock"]) {
      await expect(page.getByText(kpi, { exact: true })).toBeVisible({ timeout: 15_000 });
    }
  });
});
