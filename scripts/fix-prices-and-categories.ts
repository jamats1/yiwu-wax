/**
 * One-off fixer for product data in Sanity.
 *
 * - Fixes prices that were imported as cents (e.g. 1495 -> 14.95)
 * - Normalizes categories into:
 *   - Super Wax
 *   - Grand Super Wax
 *   - Kente
 *   - Hollandais
 *   - Hytarguet
 */

import { createClient } from "@sanity/client";
import dotenv from "dotenv";
import { join } from "path";

dotenv.config({ path: join(process.cwd(), ".env.local") });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  useCdn: false,
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_WRITE_TOKEN!,
});

type NormalizedCategory =
  | "Super Wax"
  | "Grand Super Wax"
  | "Kente"
  | "Hollandais"
  | "Hytarguet";

interface ProductDoc {
  _id: string;
  name: string;
  price: number;
  originalUrl?: string;
  category?: {
    _id: string;
    title: string;
  } | null;
}

interface CategoryDoc {
  _id: string;
  title: string;
}

function fixPrice(price: number): number {
  // If price looks like cents (>= 100), divide by 100 and round to 2 decimals.
  if (price >= 100) {
    const fixed = price / 100;
    return Math.round(fixed * 100) / 100;
  }
  return price;
}

function detectCategory(p: ProductDoc): NormalizedCategory | null {
  const name = p.name.toLowerCase();
  const catTitle = (p.category?.title || "").toLowerCase();
  const url = (p.originalUrl || "").toLowerCase();
  const text = `${name} ${catTitle} ${url}`;

  if (text.includes("kente")) return "Kente";
  if (text.includes("grand super wax")) return "Grand Super Wax";
  if (text.includes("super wax")) return "Super Wax";
  if (text.includes("hollandais") || text.includes("vlisco")) return "Hollandais";
  if (
    text.includes("hitarget") ||
    text.includes("hytarguet") ||
    text.includes("high target")
  ) {
    return "Hytarguet";
  }

  return null;
}

async function ensureCategories(): Promise<Record<NormalizedCategory, string>> {
  console.log("🔎 Ensuring normalized category documents exist...");

  const titles: NormalizedCategory[] = [
    "Super Wax",
    "Grand Super Wax",
    "Kente",
    "Hollandais",
    "Hytarguet",
  ];

  const existing = await client.fetch<CategoryDoc[]>(
    `*[_type == "category" && title in $titles]{_id,title}`,
    { titles }
  );

  const map: Partial<Record<NormalizedCategory, string>> = {};
  for (const cat of existing) {
    map[cat.title as NormalizedCategory] = cat._id;
  }

  for (const title of titles) {
    if (!map[title]) {
      const slug = title.toLowerCase().replace(/\s+/g, "-");
      const created = await client.create({
        _type: "category",
        title,
        slug: { _type: "slug", current: slug },
      });
      console.log(`  ➕ Created category "${title}" (${created._id})`);
      map[title] = created._id;
    } else {
      console.log(`  ✅ Found category "${title}" (${map[title]})`);
    }
  }

  return map as Record<NormalizedCategory, string>;
}

async function run() {
  console.log("🚀 Fixing prices and categories in Sanity...\n");

  if (
    !process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
    !process.env.NEXT_PUBLIC_SANITY_DATASET ||
    !process.env.SANITY_API_WRITE_TOKEN
  ) {
    throw new Error("Sanity environment variables are not fully configured.");
  }

  const categoryIds = await ensureCategories();

  const products = await client.fetch<ProductDoc[]>(
    `*[_type == "product"]{
      _id,
      name,
      price,
      originalUrl,
      category->{_id,title}
    }`
  );

  console.log(`📦 Found ${products.length} products\n`);

  let priceFixed = 0;
  let categoryUpdated = 0;
  let skippedNoCategoryMatch = 0;

  const batchSize = 20;

  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    console.log(
      `🧩 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
        products.length / batchSize
      )} (${batch.length} products)...`
    );

    for (const p of batch) {
      const updates: Record<string, unknown> = {};

      const newPrice = fixPrice(p.price);
      if (newPrice !== p.price) {
        updates.price = newPrice;
        priceFixed++;
      }

      const normalized = detectCategory(p);
      if (normalized) {
        const targetCatId = categoryIds[normalized];
        if (!p.category || p.category._id !== targetCatId) {
          updates.category = {
            _type: "reference",
            _ref: targetCatId,
          };
          categoryUpdated++;
        }
      } else {
        skippedNoCategoryMatch++;
      }

      if (Object.keys(updates).length === 0) {
        continue;
      }

      try {
        await client.patch(p._id).set(updates).commit();
      } catch (err: any) {
        console.error(`  ❌ Failed to update ${p.name} (${p._id}):`, err.message || err);
      }
    }

    if (i + batchSize < products.length) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  console.log("\n✅ Fix completed.");
  console.log(`   Prices fixed (÷100): ${priceFixed}`);
  console.log(`   Categories normalized: ${categoryUpdated}`);
  console.log(`   Products with no category match: ${skippedNoCategoryMatch}`);
}

run()
  .then(() => {
    console.log("\n✨ Done!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Error running fixer:", err);
    process.exit(1);
  });

