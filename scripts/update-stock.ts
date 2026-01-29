/**
 * Update stock quantity for all products in Sanity
 * Sets stock to a specified value (default: 1000) and ensures availability is "in_stock"
 */

import { createClient } from "@sanity/client";
import dotenv from "dotenv";
import { join } from "path";

// Load environment variables
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
  stock?: number;
  availability?: string;
}

async function updateStock(stockQuantity: number = 1000) {
  console.log(`📦 Updating stock for all products to ${stockQuantity}...\n`);

  // Fetch all products
  const products = await client.fetch<Product[]>(
    `*[_type == "product"] {
      _id,
      name,
      stock,
      availability
    }`
  );

  console.log(`Found ${products.length} products to update\n`);

  let updated = 0;
  let failed = 0;

  // Batch update for better performance
  const batchSize = 20;
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(products.length / batchSize);
    
    console.log(`Processing batch ${batchNum}/${totalBatches} (${batch.length} products)...`);

    for (const product of batch) {
      try {
        // Update stock and ensure availability is in_stock
        await client
          .patch(product._id)
          .set({
            stock: stockQuantity,
            availability: "in_stock",
          })
          .commit();

        updated++;
        if (updated % 50 === 0) {
          console.log(`  Progress: ${updated}/${products.length} updated`);
        }
      } catch (error: any) {
        failed++;
        console.error(`  ❌ Failed to update ${product.name} (${product._id}):`, error.message);
      }
    }

    // Small delay between batches to avoid rate limiting
    if (i + batchSize < products.length) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  console.log(`\n✅ Stock update complete!`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Failed: ${failed}`);
  console.log(`   Stock quantity set to: ${stockQuantity}`);
  console.log(`   All products set to: in_stock`);
}

// Get stock quantity from command line argument or use default
const stockArg = process.argv[2];
const stockQuantity = stockArg ? parseInt(stockArg, 10) : 1000;

if (isNaN(stockQuantity) || stockQuantity < 0) {
  console.error("❌ Invalid stock quantity. Please provide a positive number.");
  console.log("Usage: pnpm run stock [quantity]");
  console.log("Example: pnpm run stock 100");
  console.log("Example: pnpm run stock 1000");
  process.exit(1);
}

// Run update
updateStock(stockQuantity)
  .then(() => {
    console.log("\n✨ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
