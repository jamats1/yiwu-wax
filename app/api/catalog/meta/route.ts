import { NextResponse } from "next/server";
import { groq } from "next-sanity";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import { getSiteUrl } from "@/lib/site-url";

const CATALOG_QUERY = groq`
  *[_type == "product" && active != false] | order(_createdAt desc) {
    _id, name, slug, description, price, currency,
    images, availability, material, colors, stock, sku, category->{ title }
  }
`;

type SanityProduct = {
  _id: string;
  name: string;
  slug: { current: string };
  description?: string;
  price: number;
  currency?: string;
  images?: Record<string, unknown>[];
  availability?: string;
  material?: string;
  colors?: string[];
  stock?: number;
  sku?: string;
  category?: { title: string };
};

function csvEscape(val: unknown): string {
  const str = String(val ?? "");
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET() {
  const siteUrl = getSiteUrl();

  let products: SanityProduct[] = [];
  try {
    products = await client.fetch(CATALOG_QUERY);
  } catch {
    return new NextResponse("Failed to fetch products", { status: 502 });
  }

  const HEADERS = [
    "id",
    "title",
    "description",
    "availability",
    "condition",
    "price",
    "link",
    "image_link",
    "additional_image_link",
    "brand",
    "google_product_category",
    "product_type",
    "color",
    "material",
    "sku",
    "retailer_id",
  ];

  const rows = products.map((p) => {
    const inStock =
      p.availability === "in_stock" ||
      (p.availability !== "sold_out" && (p.stock ?? 0) > 0);

    const currency = p.currency || "USD";
    const price = `${p.price.toFixed(2)} ${currency}`;
    const link = `${siteUrl}/products/${p.slug.current}`;

    const rawDesc =
      p.description ||
      `Premium African wax print fabric — ${p.name}. Sold by the yard. 100% authentic wax print.`;
    const desc = rawDesc.replace(/\r?\n/g, " ").slice(0, 5000);

    const imageUrl = p.images?.[0]
      ? urlFor(p.images[0]).width(1200).height(1200).url()
      : "";

    // Meta supports up to 10 additional images separated by a comma inside a quoted field
    const additionalImages = (p.images?.slice(1, 11) ?? [])
      .map((img) => urlFor(img).width(1200).height(1200).url())
      .join(",");

    const colors = (p.colors ?? []).join(", ");
    const material = p.material ? p.material.replace("-", " ") : "";
    const sku = p.sku || p._id;
    const productType = p.category?.title
      ? `African Wax Print Fabrics > ${p.category.title}`
      : "African Wax Print Fabrics";

    return [
      p._id,
      p.name,
      desc,
      inStock ? "in stock" : "out of stock",
      "new",
      price,
      link,
      imageUrl,
      additionalImages,
      "Yiwu Wax",
      "Arts & Entertainment > Hobbies & Creative Arts > Crafts & Sewing > Fabric",
      productType,
      colors,
      material,
      sku,
      sku,
    ]
      .map(csvEscape)
      .join(",");
  });

  const csv = [HEADERS.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=7200",
      "Content-Disposition": 'attachment; filename="yiwuwax-catalog.csv"',
    },
  });
}
