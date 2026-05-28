/**
 * Remove or disable Sanity products that have an originalUrl (scraped source link).
 *
 * Usage:
 *   npm run cleanup-original              # dry-run (default)
 *   npm run cleanup-original -- --execute # apply changes
 *   npm run cleanup-original -- --execute --action=delete
 *   npm run cleanup-original -- --execute --action=disable
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

interface Product {
  _id: string;
  name: string;
  originalUrl?: string;
  active?: boolean;
}

type Action = "delete" | "disable";

function parseArgs() {
  const argv = process.argv.slice(2);
  const execute = argv.includes("--execute");
  const actionArg = argv.find((a) => a.startsWith("--action="));
  const action: Action =
    actionArg?.split("=")[1] === "disable" ? "disable" : "delete";
  return { execute, action };
}

async function removeOriginalUrlProducts() {
  const { execute, action } = parseArgs();

  console.log(
    execute
      ? `🗑️  ${action === "delete" ? "Deleting" : "Disabling"} products with originalUrl...\n`
      : "🔍 Dry run — products with originalUrl (pass --execute to apply)\n",
  );

  const products = await client.fetch<Product[]>(
    `*[_type == "product" && defined(originalUrl) && originalUrl != ""] {
      _id,
      name,
      originalUrl,
      active
    } | order(name asc)`,
  );

  console.log(`Found ${products.length} products with originalUrl\n`);

  if (products.length === 0) {
    console.log("✅ Nothing to do.");
    return;
  }

  products.slice(0, 10).forEach((p, i) => {
    console.log(`  ${i + 1}. ${p.name}`);
    console.log(`     ${p.originalUrl}`);
  });
  if (products.length > 10) {
    console.log(`  ... and ${products.length - 10} more`);
  }

  if (!execute) {
    console.log(`\n⚠️  Dry run only. Re-run with --execute to ${action} these products.`);
    console.log(`   Example: npm run cleanup-original -- --execute --action=${action}`);
    return;
  }

  let succeeded = 0;
  let failed = 0;
  const batchSize = 10;

  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(products.length / batchSize);
    console.log(`\nBatch ${batchNum}/${totalBatches} (${batch.length} products)...`);

    for (const product of batch) {
      try {
        if (action === "delete") {
          await client.delete(product._id);
        } else {
          await client
            .patch(product._id)
            .set({ active: false, availability: "sold_out", stock: 0 })
            .commit();
        }
        succeeded++;
      } catch (error: unknown) {
        failed++;
        const message = error instanceof Error ? error.message : String(error);
        console.error(`  ❌ ${product.name} (${product._id}): ${message}`);
      }
    }

    if (i + batchSize < products.length) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  console.log(`\n✅ Done (${action})`);
  console.log(`   Succeeded: ${succeeded}`);
  console.log(`   Failed: ${failed}`);
}

removeOriginalUrlProducts()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
