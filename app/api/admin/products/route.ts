import type { Transaction } from "@sanity/client";
import { NextResponse } from "next/server";
import { groq } from "next-sanity";
import { requireAdmin } from "@/lib/admin-auth";
import { writeClient } from "@/sanity/lib/client";

interface ProductRow {
  _id: string;
  name?: string;
  slug?: { current: string };
  description?: string;
  imageCount?: number;
  [key: string]: unknown;
}

const ANALYTICS_WINDOW_DAYS = 90;

/** Product quality score, Shopify-style "product health". */
function healthScore(p: {
  imageCount: number;
  description: string;
  hasPrice: boolean;
  reviewCount: number;
  name: string;
  hasSlug: boolean;
}) {
  const checks = {
    images: p.imageCount >= 2 ? "good" : p.imageCount === 1 ? "ok" : "missing",
    description:
      p.description.length >= 80 ? "good" : p.description.length > 0 ? "ok" : "missing",
    pricing: p.hasPrice ? "good" : "missing",
    reviews: p.reviewCount > 0 ? "good" : "missing",
    seo: p.hasSlug && p.name.length > 0 && p.name.length <= 120 ? "good" : "ok",
  } as const;

  let score = 0;
  score += checks.images === "good" ? 25 : checks.images === "ok" ? 15 : 0;
  score += checks.description === "good" ? 25 : checks.description === "ok" ? 10 : 0;
  score += checks.pricing === "good" ? 20 : 0;
  score += checks.reviews === "good" ? 15 : 0;
  score += checks.seo === "good" ? 15 : 5;

  return { score, checks };
}

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const since = new Date(
    Date.now() - ANALYTICS_WINDOW_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();

  const [products, categories, productPageViews, cartEvents, reviewRows] =
    await Promise.all([
      writeClient.fetch<ProductRow[]>(
        groq`*[_type == "product"] | order(_createdAt desc) {
          _id,
          _createdAt,
          name,
          slug,
          description,
          fabricType,
          priceRmb,
          price,
          material,
          colors,
          stock,
          availability,
          sku,
          featured,
          active,
          "imageUrl": images[0].asset->url,
          "imageCount": count(images),
          "categoryId": category._ref,
          "categoryName": category->name
        }`,
      ),
      writeClient.fetch<Array<{ _id: string; name: string }>>(
        groq`*[_type == "category"] | order(name asc) { _id, name }`,
      ),
      writeClient.fetch<Array<{ productId?: string; path?: string }>>(
        groq`*[_type == "pageView" && _createdAt >= $since && (defined(productId) || string::startsWith(path, "/products/"))] { productId, path }`,
        { since },
      ),
      writeClient.fetch<
        Array<{
          eventType?: string;
          items?: Array<{ productId?: string; quantity?: number; price?: number }>;
        }>
      >(
        groq`*[_type == "cartEvent" && _createdAt >= $since && eventType in ["add_to_cart", "cart_converted"]] { eventType, items[]{ productId, quantity, price } }`,
        { since },
      ),
      writeClient.fetch<Array<{ productId?: string }>>(
        groq`*[_type == "review"] { productId }`,
      ),
    ]);

  // Index analytics by product id (page views may only carry the slug path).
  const slugToId = new Map<string, string>();
  for (const p of products) {
    if (p.slug?.current) slugToId.set(p.slug.current, p._id);
  }

  const views = new Map<string, number>();
  for (const pv of productPageViews) {
    let id = pv.productId;
    if (!id && pv.path?.startsWith("/products/")) {
      id = slugToId.get(pv.path.slice("/products/".length).split(/[/?#]/)[0]);
    }
    if (id) views.set(id, (views.get(id) || 0) + 1);
  }

  const carts = new Map<string, number>();
  const sales = new Map<string, { units: number; revenue: number }>();
  for (const ev of cartEvents) {
    for (const item of ev.items || []) {
      if (!item.productId) continue;
      if (ev.eventType === "add_to_cart") {
        carts.set(item.productId, (carts.get(item.productId) || 0) + 1);
      } else if (ev.eventType === "cart_converted") {
        const entry = sales.get(item.productId) || { units: 0, revenue: 0 };
        entry.units += item.quantity || 1;
        entry.revenue += (item.price || 0) * (item.quantity || 1);
        sales.set(item.productId, entry);
      }
    }
  }

  const reviewCounts = new Map<string, number>();
  for (const r of reviewRows) {
    if (r.productId) {
      reviewCounts.set(r.productId, (reviewCounts.get(r.productId) || 0) + 1);
    }
  }

  const enriched = products.map((p) => {
    const productViews = views.get(p._id) || 0;
    const productSales = sales.get(p._id) || { units: 0, revenue: 0 };
    const reviewCount = reviewCounts.get(p._id) || 0;
    const health = healthScore({
      imageCount: p.imageCount || 0,
      description: p.description || "",
      hasPrice: !!(p.priceRmb || p.fabricType || p.price),
      reviewCount,
      name: p.name || "",
      hasSlug: !!p.slug?.current,
    });
    return {
      ...p,
      views: productViews,
      addToCart: carts.get(p._id) || 0,
      sales: productSales.units,
      revenue: Math.round(productSales.revenue * 100) / 100,
      conversion:
        productViews > 0
          ? Math.round((productSales.units / productViews) * 10000) / 100
          : 0,
      reviewCount,
      health,
    };
  });

  return NextResponse.json({
    success: true,
    products: enriched,
    categories,
    analyticsWindowDays: ANALYTICS_WINDOW_DAYS,
  });
}

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await req.json();
  const product = {
    _type: "product",
    name: body.name,
    slug: { _type: "slug", current: body.slug },
    description: body.description || "",
    fabricType: body.fabricType || null,
    priceRmb: body.priceRmb || null,
    material: body.material || "cotton",
    colors: body.colors || [],
    stock: body.stock ?? 0,
    availability: body.availability || "in_stock",
    sku: body.sku || "",
    featured: body.featured ?? false,
    active: body.active ?? true,
    currency: "CNY",
    ...(body.categoryId
      ? { category: { _type: "reference", _ref: body.categoryId } }
      : {}),
  };

  const created = await writeClient.create(product);
  return NextResponse.json({ success: true, product: created });
}

export async function PUT(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await req.json();
  const { _id, categoryId, ...fields } = body;
  if (!_id) return NextResponse.json({ error: "Missing _id" }, { status: 400 });

  let patch = writeClient.patch(_id).set(fields);
  if (categoryId === null) {
    patch = patch.unset(["category"]);
  } else if (typeof categoryId === "string" && categoryId) {
    patch = patch.set({ category: { _type: "reference", _ref: categoryId } });
  }

  const updated = await patch.commit();
  return NextResponse.json({ success: true, product: updated });
}

/**
 * Bulk actions over selected products.
 * Body: { action, ids: string[], value? }
 *   action: activate | deactivate | feature | unfeature | delete
 *         | setCategory (value: category _id | null)
 *         | setPrice (value: RMB number)
 *         | setStock (value: number)
 */
export async function PATCH(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await req.json();
  const { action, ids, value } = body as {
    action?: string;
    ids?: string[];
    value?: unknown;
  };
  if (!action || !Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json(
      { error: "Missing action or ids" },
      { status: 400 },
    );
  }
  if (ids.length > 200) {
    return NextResponse.json(
      { error: "Too many products in one bulk action (max 200)" },
      { status: 400 },
    );
  }

  // next-sanity re-exports a second copy of the client types, which makes the
  // returned union's .patch uncallable — pin to the @sanity/client Transaction.
  const tx = writeClient.transaction() as Transaction;
  for (const id of ids) {
    switch (action) {
      case "activate":
        tx.patch(id, { set: { active: true } });
        break;
      case "deactivate":
        tx.patch(id, { set: { active: false } });
        break;
      case "feature":
        tx.patch(id, { set: { featured: true } });
        break;
      case "unfeature":
        tx.patch(id, { set: { featured: false } });
        break;
      case "delete":
        tx.delete(id);
        break;
      case "setCategory":
        if (value === null) {
          tx.patch(id, { unset: ["category"] });
        } else if (typeof value === "string" && value) {
          tx.patch(id, {
            set: { category: { _type: "reference", _ref: value } },
          });
        } else {
          return NextResponse.json(
            { error: "setCategory requires a category id or null" },
            { status: 400 },
          );
        }
        break;
      case "setPrice": {
        const price = Number(value);
        if (!Number.isFinite(price) || price <= 0) {
          return NextResponse.json(
            { error: "setPrice requires a positive number" },
            { status: 400 },
          );
        }
        tx.patch(id, { set: { priceRmb: price } });
        break;
      }
      case "setStock": {
        const stock = Number(value);
        if (!Number.isFinite(stock) || stock < 0) {
          return NextResponse.json(
            { error: "setStock requires a non-negative number" },
            { status: 400 },
          );
        }
        tx.patch(id, { set: { stock } });
        break;
      }
      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 },
        );
    }
  }

  await tx.commit();
  return NextResponse.json({ success: true, count: ids.length });
}

export async function DELETE(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await writeClient.delete(id);
  return NextResponse.json({ success: true });
}
