/**
 * Admin security tests — run WITHOUT auth (public projects).
 * Verifies the admin area and every /api/admin endpoint reject
 * unauthenticated visitors.
 */
import { test, expect } from "@playwright/test";

const ADMIN_PAGES = [
  "/admin",
  "/admin/products",
  "/admin/orders",
  "/admin/customers",
  "/admin/analytics",
  "/admin/inventory",
  "/admin/reviews",
  "/admin/discounts",
  "/admin/marketing",
  "/admin/settings",
];

const ADMIN_APIS = [
  "/api/admin/dashboard",
  "/api/admin/products",
  "/api/admin/orders",
  "/api/admin/customers",
  "/api/admin/analytics",
  "/api/admin/reviews",
  "/api/admin/discounts",
  "/api/admin/sanity-token",
];

test.describe("Admin route protection (unauthenticated)", () => {
  // Clerk redirects browser navigations to sign-in; it answers non-document
  // requests (curl, scripts) with 404. Both mean the page never renders.
  const documentHeaders = {
    Accept: "text/html",
    "Sec-Fetch-Dest": "document",
  };

  for (const path of ADMIN_PAGES) {
    test(`${path} redirects to sign-in`, async ({ request }) => {
      const res = await request.get(path, {
        maxRedirects: 0,
        headers: documentHeaders,
      });
      expect([301, 302, 307, 308]).toContain(res.status());
      const location = res.headers()["location"] ?? "";
      expect(location).toMatch(/sign-in|clerk|accounts\./i);
    });
  }

  for (const path of ADMIN_APIS) {
    test(`GET ${path} returns 401`, async ({ request }) => {
      const res = await request.get(path, { maxRedirects: 0 });
      expect(res.status()).toBe(401);
    });
  }

  test("mutating admin APIs are also protected", async ({ request }) => {
    const post = await request.post("/api/admin/products", {
      data: { name: "hack", slug: "hack" },
      maxRedirects: 0,
    });
    expect(post.status()).toBe(401);

    const bulk = await request.patch("/api/admin/products", {
      data: { action: "delete", ids: ["someid"] },
      maxRedirects: 0,
    });
    expect(bulk.status()).toBe(401);

    const del = await request.delete("/api/admin/products?id=someid", {
      maxRedirects: 0,
    });
    expect(del.status()).toBe(401);

    const orderUpdate = await request.put("/api/admin/orders", {
      data: { _id: "someid", status: "paid" },
      maxRedirects: 0,
    });
    expect(orderUpdate.status()).toBe(401);
  });

  test("Sanity Studio requires sign-in", async ({ request }) => {
    const res = await request.get("/studio", {
      maxRedirects: 0,
      headers: documentHeaders,
    });
    expect([301, 302, 307, 308]).toContain(res.status());
  });
});
