/**
 * Assign `fabricType` to products from their existing category.
 *
 * Dry-run by default (prints what it would do). Pass --apply to write.
 *   npx tsx scripts/assign-fabric-types.ts          # preview
 *   npx tsx scripts/assign-fabric-types.ts --apply  # write
 *
 * Idempotent: only sets fabricType where it's missing or different, and never
 * touches products whose category isn't in the map.
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

// Match on category slug OR title (lower-cased), so it works regardless of
// which one a product references.
const CATEGORY_TO_FABRIC: Record<string, string> = {
  "grand-super-wax": "grand-super",
  "grand super wax": "grand-super",
  "simple lace": "lace",
  "super-wax": "superwax",
  "super wax": "superwax",
  "3d lace": "3d-lace",
  hytarguet: "hytarget",
  hytarget: "hytarget",
  hollandais: "hollandais",
};

type Row = {
  _id: string;
  name: string;
  fabricType?: string;
  catTitle?: string;
  catSlug?: string;
};

function resolveType(row: Row): string | null {
  const keys = [row.catSlug, row.catTitle].map((k) => (k || "").trim().toLowerCase());
  for (const k of keys) {
    if (k && CATEGORY_TO_FABRIC[k]) return CATEGORY_TO_FABRIC[k];
  }
  return null;
}

async function main() {
  const apply = process.argv.includes("--apply");

  const rows = await client.fetch<Row[]>(`
    *[_type == "product"]{
      _id, name, fabricType,
      "catTitle": category->title,
      "catSlug": category->slug.current
    }
  `);

  const toUpdate: { id: string; name: string; type: string }[] = [];
  const unmapped: Row[] = [];
  const counts: Record<string, number> = {};

  for (const row of rows) {
    const type = resolveType(row);
    if (!type) {
      unmapped.push(row);
      continue;
    }
    counts[type] = (counts[type] || 0) + 1;
    if (row.fabricType !== type) {
      toUpdate.push({ id: row._id, name: row.name, type });
    }
  }

  console.log(`\n${rows.length} products scanned.`);
  console.log("Resolved fabric types:");
  for (const [type, n] of Object.entries(counts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${n.toString().padStart(4)}  ${type}`);
  }
  console.log(`\n${toUpdate.length} need updating.`);
  if (unmapped.length) {
    console.log(`\n${unmapped.length} unmapped (no matching category) — assign manually:`);
    for (const u of unmapped) {
      console.log(`  • ${u.name}  (category: ${u.catTitle || "none"})`);
    }
  }

  if (!apply) {
    console.log("\nDry run. Re-run with --apply to write these changes.");
    return;
  }

  console.log("\nApplying…");
  let tx = client.transaction();
  for (const u of toUpdate) {
    tx = tx.patch(u.id, (p) => p.set({ fabricType: u.type }));
  }
  if (toUpdate.length > 0) {
    await tx.commit();
  }
  console.log(`✅ Updated ${toUpdate.length} products.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
