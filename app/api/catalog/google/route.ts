import { NextResponse } from "next/server";
import { urlFor } from "@/sanity/lib/image";
import { getSiteUrl } from "@/lib/site-url";
import { getCatalogProducts, feedPrice, type CatalogProduct } from "@/lib/catalog";

function xmlEscape(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function g(tag: string, value: unknown): string {
  if (value == null || value === "") return "";
  return `      <g:${tag}>${xmlEscape(String(value))}</g:${tag}>`;
}

export async function GET() {
  const siteUrl = getSiteUrl();

  let products: CatalogProduct[] = [];
  let rate = 1;
  try {
    ({ products, rate } = await getCatalogProducts());
  } catch {
    return new NextResponse("Failed to fetch products", { status: 502 });
  }

  const now = new Date().toUTCString();

  const items = products
    .map((p) => {
      const inStock =
        p.availability === "in_stock" ||
        (p.availability !== "sold_out" && (p.stock ?? 0) > 0);

      const price = feedPrice(p.priceRmb, rate);
      const link = `${siteUrl}/products/${p.slug.current}`;

      const rawDesc =
        p.description ||
        `Premium African wax print fabric — ${p.name}. Sold by the yard. 100% authentic wax print.`;
      const desc = rawDesc.replace(/\r?\n/g, " ").slice(0, 5000);

      const imageUrl = p.images?.[0]
        ? urlFor(p.images[0]).width(1200).height(1200).url()
        : "";

      const additionalImages = (p.images?.slice(1, 11) ?? [])
        .map((img) => `      <g:additional_image_link>${xmlEscape(urlFor(img).width(1200).height(1200).url())}</g:additional_image_link>`)
        .join("\n");

      const sku = p.sku || p._id;
      const material = p.material ? p.material.replace(/-/g, " ") : "";
      const colors = (p.colors ?? []).join(", ");
      const productType = p.category?.title
        ? `African Wax Print Fabrics > ${p.category.title}`
        : "African Wax Print Fabrics";

      return `    <item>
${g("id", p._id)}
${g("title", p.name)}
${g("description", desc)}
${g("link", link)}
${g("image_link", imageUrl)}
${additionalImages}
${g("availability", inStock ? "in stock" : "out of stock")}
${g("price", price)}
${g("condition", "new")}
${g("brand", "Yiwu Wax")}
${g("google_product_category", "Arts & Entertainment > Hobbies & Creative Arts > Crafts & Sewing > Fabric")}
${g("product_type", productType)}
${g("color", colors)}
${g("material", material)}
${g("sku", sku)}
${g("identifier_exists", "no")}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Yiwu Wax — African Wax Print Fabrics</title>
    <link>${xmlEscape(siteUrl)}</link>
    <description>Premium African wax print fabrics sold by the yard. Bold patterns, 100% cotton, fast dispatch.</description>
    <lastBuildDate>${now}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=7200",
    },
  });
}
