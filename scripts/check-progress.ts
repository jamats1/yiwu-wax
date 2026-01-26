/**
 * Quick progress checker for scraping
 */

import { readFile } from "fs/promises";
import { join } from "path";

async function checkProgress() {
  try {
    const dataPath = join(process.cwd(), "data", "scraped-products.json");
    const fileContent = await readFile(dataPath, "utf-8");
    const data = JSON.parse(fileContent);

    console.log("\n📊 Scraping Progress");
    console.log("=".repeat(50));
    console.log(`Products scraped: ${data.products.length}`);
    console.log(`Total pages processed: ${data.totalPages}`);
    console.log(`Last updated: ${new Date(data.scrapedAt).toLocaleString()}`);

    if (data.products.length > 0) {
      console.log("\n📦 Sample Products:");
      data.products.slice(0, 5).forEach((product: any, i: number) => {
        console.log(`  ${i + 1}. ${product.title.substring(0, 60)}...`);
      });
      if (data.products.length > 5) {
        console.log(`  ... and ${data.products.length - 5} more`);
      }
    }

    // Estimate progress (assuming ~28 products per page)
    const estimatedTotal = 397;
    const progress = ((data.products.length / estimatedTotal) * 100).toFixed(1);
    console.log(`\n⏳ Estimated Progress: ${progress}%`);
    console.log("=".repeat(50));
  } catch (error: any) {
    if (error.code === "ENOENT") {
      console.log("❌ No scraped data file found yet.");
      console.log("   The scraper may still be starting...");
    } else {
      console.error("Error:", error.message);
    }
  }
}

checkProgress();
