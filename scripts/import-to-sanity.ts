/**
 * Import scraped products to Sanity CMS
 * Handles image uploads and creates product documents
 */

import { readFile } from "fs/promises";
import { join } from "path";
import { createClient } from "@sanity/client";
import dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: join(process.cwd(), ".env.local") });

interface ScrapedProduct {
  title: string;
  slug: string;
  price: number;
  currency: string;
  pricePerYard: string;
  images: string[];
  description: string;
  availability: "in_stock" | "sold_out";
  category: string;
  colors: string[];
  material: string;
  url: string;
  sku?: string;
}

interface ScrapeResult {
  products: ScrapedProduct[];
  totalPages: number;
  scrapedAt: string;
}

// Initialize Sanity client
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  useCdn: false,
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_WRITE_TOKEN!,
});

// Upload image to Sanity
async function uploadImageToSanity(imageUrl: string): Promise<string | null> {
  try {
    console.log(`  Uploading image: ${imageUrl}`);
    const response = await globalThis.fetch(imageUrl);
    if (!response.ok) {
      console.warn(`  Failed to fetch image: ${response.statusText}`);
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const asset = await client.assets.upload("image", buffer, {
      filename: imageUrl.split("/").pop() || "image.jpg",
    });

    return asset._id;
  } catch (error) {
    console.error(`  Error uploading image:`, error);
    return null;
  }
}

// Get or create category
async function getOrCreateCategory(
  categoryName: string
): Promise<string | null> {
  try {
    // Check if category exists
    const existing = await client.fetch(
      `*[_type == "category" && title == $title][0]`,
      { title: categoryName }
    );

    if (existing) {
      return existing._id;
    }

    // Create new category
    const slug = categoryName.toLowerCase().replace(/\s+/g, "-");
    const category = await client.create({
      _type: "category",
      title: categoryName,
      slug: {
        _type: "slug",
        current: slug,
      },
    });

    return category._id;
  } catch (error) {
    console.error(`Error creating category:`, error);
    return null;
  }
}

// Import a single product
async function importProduct(
  product: ScrapedProduct,
  index: number,
  total: number
): Promise<void> {
  try {
    console.log(`[${index + 1}/${total}] Importing: ${product.title}`);

    // Check if product already exists
    const existing = await client.fetch(
      `*[_type == "product" && slug.current == $slug][0]`,
      { slug: product.slug }
    );

    if (existing) {
      console.log(`  ⏭️  Already exists, skipping`);
      return;
    }

    // Get or create category
    const categoryId = await getOrCreateCategory(product.category);

    // Upload images
    const imageIds: string[] = [];
    for (const imageUrl of product.images.slice(0, 5)) {
      // Limit to 5 images per product
      const imageId = await uploadImageToSanity(imageUrl);
      if (imageId) {
        imageIds.push(imageId);
      }
      // Rate limiting between image uploads
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Create product document
    const productDoc = {
      _type: "product",
      name: product.title,
      slug: {
        _type: "slug",
        current: product.slug,
      },
      description: product.description || "",
      price: product.price,
      currency: product.currency === "€" ? "EUR" : product.currency,
      pricePerYard: product.pricePerYard,
      images: imageIds.map((id) => ({
        _type: "image",
        asset: {
          _type: "reference",
          _ref: id,
        },
      })),
      category: categoryId
        ? {
            _type: "reference",
            _ref: categoryId,
          }
        : undefined,
      material: product.material || "cotton",
      colors: product.colors || [],
      stock: product.availability === "in_stock" ? 100 : 0,
      availability: product.availability,
      sku: product.sku || undefined,
      originalUrl: product.url,
      featured: false,
    };

    await client.create(productDoc);
    console.log(`  ✅ Imported successfully`);
  } catch (error) {
    console.error(`  ❌ Error importing product:`, error);
  }
}

// Main import function
async function importProducts(): Promise<void> {
  console.log("🚀 Starting Sanity import...");

  // Check environment variables
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    throw new Error("NEXT_PUBLIC_SANITY_PROJECT_ID is not set");
  }
  if (!process.env.NEXT_PUBLIC_SANITY_DATASET) {
    throw new Error("NEXT_PUBLIC_SANITY_DATASET is not set");
  }
  if (!process.env.SANITY_API_WRITE_TOKEN) {
    throw new Error("SANITY_API_WRITE_TOKEN is not set");
  }

  // Read scraped data
  const dataPath = join(process.cwd(), "data", "scraped-products.json");
  const fileContent = await readFile(dataPath, "utf-8");
  const data: ScrapeResult = JSON.parse(fileContent);

  console.log(`📦 Found ${data.products.length} products to import`);

  // Import each product
  for (let i = 0; i < data.products.length; i++) {
    await importProduct(data.products[i], i, data.products.length);

    // Rate limiting between products
    if (i < data.products.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  console.log("\n✅ Import complete!");
}

// Run import
importProducts()
  .then(() => {
    console.log("✨ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Import failed:", error);
    process.exit(1);
  });
