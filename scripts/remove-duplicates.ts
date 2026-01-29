/**
 * Remove duplicate products from Sanity
 * Finds duplicates by slug and keeps the first one
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
  _type: string;
  name: string;
  slug: {
    current: string;
  };
  _createdAt: string;
}

async function findAndRemoveDuplicates() {
  console.log("🔍 Checking for duplicate products in Sanity...\n");

  // Fetch all products
  const products = await client.fetch<Product[]>(
    `*[_type == "product"] | order(_createdAt asc) {
      _id,
      _type,
      name,
      slug,
      _createdAt
    }`
  );

  console.log(`📦 Total products found: ${products.length}`);

  // Group by slug to find duplicates
  const productsBySlug = new Map<string, Product[]>();

  products.forEach((product) => {
    const slug = product.slug?.current || "";
    if (!slug) return;

    if (!productsBySlug.has(slug)) {
      productsBySlug.set(slug, []);
    }
    productsBySlug.get(slug)!.push(product);
  });

  // Find duplicates (slugs with more than one product)
  const duplicates: { slug: string; products: Product[] }[] = [];
  productsBySlug.forEach((productList, slug) => {
    if (productList.length > 1) {
      duplicates.push({ slug, products: productList });
    }
  });

  if (duplicates.length === 0) {
    console.log("✅ No duplicates found!");
    return;
  }

  console.log(`\n⚠️  Found ${duplicates.length} duplicate groups:\n`);

  let totalToDelete = 0;
  const toDelete: string[] = [];

  duplicates.forEach(({ slug, products }) => {
    console.log(`  Slug: "${slug}"`);
    console.log(`    Found ${products.length} products:`);
    
    // Sort by creation date, keep the oldest (first created)
    const sorted = products.sort(
      (a, b) => new Date(a._createdAt).getTime() - new Date(b._createdAt).getTime()
    );
    
    const keep = sorted[0];
    const deleteList = sorted.slice(1);

    console.log(`    ✅ Keeping: ${keep.name} (${keep._id}) - Created: ${new Date(keep._createdAt).toLocaleString()}`);
    
    deleteList.forEach((product) => {
      console.log(`    ❌ Deleting: ${product.name} (${product._id}) - Created: ${new Date(product._createdAt).toLocaleString()}`);
      toDelete.push(product._id);
      totalToDelete++;
    });
    console.log("");
  });

  console.log(`\n📊 Summary:`);
  console.log(`   Total duplicates to delete: ${totalToDelete}`);
  console.log(`   Unique products to keep: ${products.length - totalToDelete}\n`);

  if (totalToDelete === 0) {
    console.log("✅ No duplicates to delete!");
    return;
  }

  // Delete duplicates
  console.log("🗑️  Deleting duplicate products...\n");

  let deleted = 0;
  let failed = 0;

  // Batch delete for better performance
  const batchSize = 10;
  for (let i = 0; i < toDelete.length; i += batchSize) {
    const batch = toDelete.slice(i, i + batchSize);
    console.log(`  Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(toDelete.length / batchSize)}...`);
    
    for (const id of batch) {
      try {
        await client.delete(id);
        deleted++;
        if (deleted % 50 === 0) {
          console.log(`  Progress: ${deleted}/${toDelete.length} deleted`);
        }
      } catch (error: any) {
        failed++;
        console.error(`  ❌ Failed to delete ${id}:`, error.message);
      }
    }
    
    // Small delay between batches
    if (i + batchSize < toDelete.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  console.log(`\n✅ Cleanup complete!`);
  console.log(`   Deleted: ${deleted}`);
  console.log(`   Failed: ${failed}`);
  console.log(`   Remaining products: ${products.length - deleted}`);
}

// Run cleanup
findAndRemoveDuplicates()
  .then(() => {
    console.log("\n✨ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
