import { test, expect } from "./fixtures";

/**
 * Catalog feed API tests — no auth, no browser rendering.
 * These verify the feeds are live and correctly formatted for
 * Meta, Google Merchant Center, and Pinterest.
 */
test.describe("Catalog feed API", () => {
  test("GET /api/catalog returns HTML 200", async ({ request }) => {
    const res = await request.get("/api/catalog");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("text/html");
    const body = await res.text();
    expect(body).toContain("Yiwu Wax");
    expect(body).toContain("/api/catalog/meta");
    expect(body).toContain("/api/catalog/google");
  });

  test("GET /api/catalog/meta returns CSV with required headers", async ({ request }) => {
    const res = await request.get("/api/catalog/meta");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("text/csv");

    const body = await res.text();
    const firstLine = body.split("\n")[0];

    // Required Meta catalog columns
    for (const col of ["id", "title", "availability", "price", "link", "image_link"]) {
      expect(firstLine).toContain(col);
    }

    // Should have at least a header + one data row
    const rows = body.trim().split("\n");
    expect(rows.length).toBeGreaterThan(1);
  });

  test("GET /api/catalog/meta CSV rows contain price and link", async ({ request }) => {
    const res = await request.get("/api/catalog/meta");
    const body = await res.text();
    const dataRow = body.split("\n")[1];
    // Link contains yiwuwax.com/products/
    expect(dataRow).toMatch(/\/products\//);
    // Price format: 00.00 USD
    expect(dataRow).toMatch(/\d+\.\d{2} (USD|EUR|GBP)/);
  });

  test("GET /api/catalog/google returns valid RSS XML", async ({ request }) => {
    const res = await request.get("/api/catalog/google");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("rss+xml");

    const body = await res.text();
    expect(body).toContain('<?xml version="1.0"');
    expect(body).toContain('xmlns:g="http://base.google.com/ns/1.0"');
    expect(body).toContain("<channel>");
    expect(body).toContain("<g:id>");
    expect(body).toContain("<g:price>");
    expect(body).toContain("<g:availability>");
    expect(body).toContain("Yiwu Wax");
  });

  test("GET /api/catalog/pinterest returns same format as google feed", async ({ request }) => {
    const [google, pinterest] = await Promise.all([
      request.get("/api/catalog/google"),
      request.get("/api/catalog/pinterest"),
    ]);
    expect(pinterest.status()).toBe(200);
    expect(pinterest.headers()["content-type"]).toBe(
      google.headers()["content-type"],
    );
    const pBody = await pinterest.text();
    expect(pBody).toContain("<g:id>");
  });

  test("catalog feeds respect Cache-Control headers", async ({ request }) => {
    const endpoints = ["/api/catalog/meta", "/api/catalog/google", "/api/catalog/pinterest"];
    for (const ep of endpoints) {
      const res = await request.get(ep);
      const cc = res.headers()["cache-control"] ?? "";
      expect(cc).toContain("max-age=");
    }
  });
});
