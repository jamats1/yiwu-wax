/**
 * Puppeteer scraper for AfricanFabs products
 * Best practices:
 * - Uses stealth plugin to avoid detection
 * - Respects rate limits with delays
 * - Handles pagination
 * - Extracts product images, titles, prices, descriptions
 * - Saves data as JSON for import
 */

import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { Page } from "puppeteer";
import { writeFile, mkdir, readFile } from "fs/promises";
import { join } from "path";

// Add stealth plugin to avoid detection
puppeteer.use(StealthPlugin());

interface Product {
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
  products: Product[];
  totalPages: number;
  scrapedAt: string;
}

// Rate limiting: wait between requests
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function scrapeProductPage(
  page: Page,
  productUrl: string
): Promise<Product | null> {
  try {
    await page.goto(productUrl, {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    // Wait for product content to load
    await page.waitForSelector("h1", { timeout: 10000 });

    const product = await page.evaluate(() => {
      // Extract title
      const titleEl = document.querySelector("h1");
      const title = titleEl?.textContent?.trim() || "";

      // Extract price - look for price elements
      const priceSelectors = [
        '.price',
        '[class*="price"]',
        'span[data-price]',
        '.product__price',
        '.product-price',
        '[itemprop="price"]',
      ];
      
      let priceText = "";
      for (const selector of priceSelectors) {
        const priceEl = document.querySelector(selector);
        if (priceEl) {
          priceText = priceEl.textContent?.trim() || "";
          if (priceText && priceText.match(/[\d,]+\.?\d*/)) break;
        }
      }
      
      // Extract price value (handle both 7,50 and 7.50 formats)
      const priceMatch = priceText.match(/([\d,]+)[.,]?(\d{2})?/);
      let price = 0;
      if (priceMatch) {
        const wholePart = priceMatch[1].replace(/,/g, '');
        const decimalPart = priceMatch[2] || '00';
        price = parseFloat(`${wholePart}.${decimalPart}`);
      }

      // Extract currency
      const currencyMatch = priceText.match(/[€$£]/);
      const currency = currencyMatch ? currencyMatch[0] : "€";

      // Extract price per yard
      const pricePerYardMatch = priceText.match(/€\s*([\d,]+[.,]?\d*)/i);
      const pricePerYard = pricePerYardMatch ? `€${pricePerYardMatch[1]}` : priceText;

      // Extract images - get product images only (exclude UI elements)
      const images: string[] = [];
      
      // Try product-specific selectors first
      const productImageSelectors = [
        '.product__media img',
        '.product-single__media img',
        '.product-photos img',
        '[data-product-image] img',
        '.product-gallery img',
        '.product-images img',
      ];
      
      for (const selector of productImageSelectors) {
        const imgs = document.querySelectorAll<HTMLImageElement>(selector);
        imgs.forEach((img) => {
          const src = img.src || img.getAttribute('data-src') || '';
          if (src && 
              !src.includes('cookie') && 
              !src.includes('flag') && 
              !src.includes('icon') &&
              !src.includes('logo') &&
              !src.includes('extension') &&
              !src.includes('translation') &&
              (src.includes('/files/') || src.includes('/products/')) &&
              !images.includes(src)) {
            // Get higher resolution images (remove size constraints)
            const highResSrc = src.replace(/_\d+x\d+\./g, "_2048x2048.");
            images.push(highResSrc);
          }
        });
        if (images.length > 0) break;
      }
      
      // Fallback: find images in product area
      if (images.length === 0) {
        const productArea = document.querySelector('.product, .product-single, [data-product]');
        if (productArea) {
          productArea.querySelectorAll<HTMLImageElement>('img').forEach((img) => {
            const src = img.src || img.getAttribute('data-src') || '';
            if (src && 
                !src.includes('cookie') && 
                !src.includes('flag') && 
                !src.includes('icon') &&
                !src.includes('logo') &&
                (src.includes('/files/') || src.includes('/products/')) &&
                !images.includes(src)) {
              const highResSrc = src.replace(/_\d+x\d+\./g, "_2048x2048.");
              images.push(highResSrc);
            }
          });
        }
      }

      // Extract description
      const descSelectors = [
        ".product-description",
        '[class*="description"]',
        ".product-content",
        "#product-description",
      ];
      let description = "";
      for (const selector of descSelectors) {
        const descEl = document.querySelector(selector);
        if (descEl) {
          description = descEl.textContent?.trim() || "";
          break;
        }
      }

      // Extract availability
      const soldOutEl = document.querySelector('[class*="sold-out"]');
      const availability: "in_stock" | "sold_out" = soldOutEl
        ? "sold_out"
        : "in_stock";

      // Extract colors (from product title/description, skip cookie banners)
      const colors: string[] = [];
      const colorKeywords = ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'black', 'white', 'brown', 'beige', 'grey', 'gray', 'teal', 'turquoise', 'burgundy', 'salmon', 'lime', 'mustard', 'olive', 'peach', 'rose', 'gold', 'bronze', 'khaki', 'maroon', 'cream'];
      
      const textToSearch = (title + ' ' + description).toLowerCase();
      colorKeywords.forEach(color => {
        if (textToSearch.includes(color) && !colors.includes(color)) {
          colors.push(color);
        }
      });

      // Extract material (usually in title or description)
      const materialMatch =
        title.match(/100%\s*(cotton|poly|polyester)/i) ||
        description.match(/100%\s*(cotton|poly|polyester)/i);
      const material = materialMatch
        ? materialMatch[1].toLowerCase()
        : "cotton";

      // Extract SKU if available
      const skuEl = document.querySelector('[class*="sku"], [data-sku]');
      const sku = skuEl?.textContent?.trim();

      return {
        title,
        slug: "",
        price,
        currency,
        pricePerYard,
        images: images.slice(0, 10), // Limit to 10 images
        description,
        availability,
        category: "African Fabrics",
        colors,
        material,
        url: window.location.href,
        sku,
      };
    });

    // Generate slug from title
    product.slug = product.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    return product;
  } catch (error) {
    console.error(`Error scraping product ${productUrl}:`, error);
    return null;
  }
}

async function scrapeProductListPage(
  page: Page,
  pageNum: number
): Promise<{ productUrls: string[]; hasNextPage: boolean; totalPages: number }> {
  const url = `https://africanfabs.com/collections/african-fabrics?page=${pageNum}`;

  try {
    console.log(`    Navigating to: ${url}`);
    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    // Wait a bit for dynamic content
    await delay(2000);

    // Wait for product grid to load - try multiple selectors
    try {
      await page.waitForSelector("a[href*='/products/']", { timeout: 15000 });
    } catch (e) {
      // Try alternative selectors
      console.log(`    Waiting for alternative selectors...`);
      await page.waitForSelector("a[href*='products']", { timeout: 10000 }).catch(() => {});
    }

    const { productUrls, hasNextPage, totalPages } = await page.evaluate(() => {
      // Find all product links - try multiple selectors
      let productLinks: HTMLAnchorElement[] = [];
      
      // Method 1: Direct product links
      const links1 = Array.from(
        document.querySelectorAll<HTMLAnchorElement>('a[href*="/products/"]')
      );
      productLinks.push(...links1);
      
      // Method 2: Collection product links
      const links2 = Array.from(
        document.querySelectorAll<HTMLAnchorElement>('a[href*="/collections/african-fabrics/products/"]')
      );
      productLinks.push(...links2);
      
      // Method 3: Any link with products in href
      const links3 = Array.from(
        document.querySelectorAll<HTMLAnchorElement>('a[href*="products"]')
      );
      productLinks.push(...links3);

      // Remove duplicates and filter
      const uniqueLinks = new Map<string, HTMLAnchorElement>();
      productLinks.forEach(link => {
        const href = link.href || link.getAttribute('href') || '';
        if (href && href.includes('/products/') && !href.includes('#') && !href.includes('javascript:')) {
          uniqueLinks.set(href, link);
        }
      });

      const urls = Array.from(uniqueLinks.keys())
        .map((href) => {
          // Ensure full URL
          if (href.startsWith("/")) {
            return `https://africanfabs.com${href}`;
          }
          if (href.startsWith("http")) {
            return href;
          }
          return `https://africanfabs.com${href}`;
        })
        .filter((url, index, self) => self.indexOf(url) === index); // Remove duplicates

      // Check for pagination - multiple methods
      let hasNext = false;
      let totalPagesCount = 1;
      
      // Method 1: Check for next arrow button
      const nextButton = document.querySelector('a[href*="page="]');
      if (nextButton) {
        const nextText = nextButton.textContent || '';
        const nextHref = nextButton.getAttribute('href') || '';
        hasNext = nextText.includes('→') || nextText.includes('Next') || nextHref.includes('page=');
      }
      
      // Method 2: Check pagination numbers
      const paginationLinks = Array.from(document.querySelectorAll('a[href*="page="], span[class*="page"]'));
      const pageNumbers: number[] = [];
      paginationLinks.forEach(link => {
        const href = link.getAttribute('href') || '';
        const text = link.textContent || '';
        const pageMatch = href.match(/page=(\d+)/) || text.match(/(\d+)/);
        if (pageMatch) {
          const pageNum = parseInt(pageMatch[1], 10);
          if (!isNaN(pageNum) && pageNum > 0 && pageNum < 100) {
            pageNumbers.push(pageNum);
          }
        }
      });
      
      if (pageNumbers.length > 0) {
        totalPagesCount = Math.max(...pageNumbers);
        const currentPageMatch = window.location.href.match(/page=(\d+)/);
        const currentPage = currentPageMatch ? parseInt(currentPageMatch[1], 10) : 1;
        hasNext = currentPage < totalPagesCount;
        console.log(`[DEBUG] Found page numbers: ${pageNumbers.join(', ')}, max: ${totalPagesCount}, current: ${currentPage}`);
      }
      
      // Method 3: Check for "Next" text in pagination
      if (!hasNext) {
        const paginationText = document.body.textContent || '';
        if (paginationText.includes('Next') || paginationText.includes('→')) {
          hasNext = true;
        }
      }

      return {
        productUrls: urls,
        hasNextPage: hasNext,
        totalPages: totalPagesCount,
      };
    });

    console.log(`    Found ${productUrls.length} product URLs on page ${pageNum}`);
    return { productUrls, hasNextPage, totalPages };
  } catch (error: any) {
    console.error(`❌ Error scraping list page ${pageNum}:`, error.message);
    console.error(`   Stack:`, error.stack);
    return { productUrls: [], hasNextPage: false, totalPages: 1 };
  }
}

async function scrapeAllProducts(): Promise<ScrapeResult> {
  console.log("🚀 Starting AfricanFabs scraper...");

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--disable-gpu",
    ],
  });

  const page = await browser.newPage();

  // Set viewport
  await page.setViewport({ width: 1920, height: 1080 });

  // Set user agent to avoid detection
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  );

  const allProducts: Product[] = [];
  let currentPage = 1;
  let hasNextPage = true;
  let detectedTotalPages = 14; // Default, will be updated
  const maxPages = 20; // Safety limit

  // First, collect all product URLs
  console.log("📋 Collecting product URLs from all pages...");
  const allProductUrls: string[] = [];
  const seenUrls = new Set<string>(); // Track duplicates

  while (hasNextPage && currentPage <= maxPages) {
    console.log(`  📄 Scraping list page ${currentPage}...`);
    const { productUrls, hasNextPage: next, totalPages } = await scrapeProductListPage(
      page,
      currentPage
    );
    
    // Update detected total pages if found
    if (totalPages > detectedTotalPages) {
      detectedTotalPages = totalPages;
    }
    
    // Add unique URLs only
    let newUrls = 0;
    productUrls.forEach(url => {
      if (!seenUrls.has(url)) {
        seenUrls.add(url);
        allProductUrls.push(url);
        newUrls++;
      }
    });
    
    console.log(`     Found ${newUrls} new products (${productUrls.length} total on page, ${allProductUrls.length} unique total)`);
    
    // Save URL collection progress every 5 pages
    if (currentPage % 5 === 0 || !next) {
      const tempResult: ScrapeResult = {
        products: [],
        totalPages: currentPage,
        scrapedAt: new Date().toISOString(),
      };
      const tempPath = join(process.cwd(), "data", "scraped-products.json");
      await writeFile(tempPath, JSON.stringify(tempResult, null, 2));
      console.log(`  💾 URL collection progress saved (${allProductUrls.length} URLs collected)`);
    }
    
    hasNextPage = next;
    currentPage++;

    // Rate limiting between pages
    await delay(2000);
    
    // If we detected total pages and reached it, stop
    if (detectedTotalPages > 1 && currentPage > detectedTotalPages) {
      console.log(`  ✅ Reached detected total pages (${detectedTotalPages})`);
      hasNextPage = false;
    }
    
    // Safety: if no new URLs found for 2 consecutive pages, stop
    if (newUrls === 0 && currentPage > 2) {
      console.log(`  ⚠️  No new URLs found on page ${currentPage}, stopping URL collection`);
      hasNextPage = false;
    }
  }

  console.log(`\n✅ URL Collection Complete!`);
  console.log(`   Total unique products found: ${allProductUrls.length}`);
  console.log(`   Pages processed: ${currentPage - 1}`);
  console.log(`   Detected total pages: ${detectedTotalPages}`);
  
  if (allProductUrls.length === 0) {
    console.log(`\n❌ ERROR: No product URLs collected!`);
    console.log(`   This might indicate:`);
    console.log(`   - Website structure changed`);
    console.log(`   - Selectors need updating`);
    console.log(`   - Network/access issues`);
    await browser.close();
    throw new Error("No product URLs collected");
  }
  
  console.log(`\n`);

  // Load existing products to resume
  const existingDataPath = join(process.cwd(), "data", "scraped-products.json");
  let existingProducts: Product[] = [];
  let startIndex = 0;
  
  try {
    const existingContent = await readFile(existingDataPath, "utf-8");
    const existingData = JSON.parse(existingContent);
    existingProducts = existingData.products || [];
    const existingUrls = new Set(existingProducts.map((p: Product) => p.url));
    
    // Find where to resume
    for (let i = 0; i < allProductUrls.length; i++) {
      if (!existingUrls.has(allProductUrls[i])) {
        startIndex = i;
        break;
      }
    }
    
    if (startIndex > 0) {
      console.log(`📂 Resuming from product ${startIndex + 1} (${existingProducts.length} already scraped)`);
      allProducts = existingProducts;
    }
  } catch (error) {
    // File doesn't exist or is invalid, start fresh
    console.log("📝 Starting fresh scrape");
  }

  // Now scrape each product
  console.log("🛍️  Scraping product details...");
  for (let i = startIndex; i < allProductUrls.length; i++) {
    const url = allProductUrls[i];
    console.log(`  [${i + 1}/${allProductUrls.length}] ${url}`);

    try {
      const product = await scrapeProductPage(page, url);
      if (product) {
        allProducts.push(product);
        
        // Save progress incrementally every 10 products
        if ((i + 1) % 10 === 0 || i === allProductUrls.length - 1) {
          const tempResult: ScrapeResult = {
            products: allProducts,
            totalPages: currentPage - 1,
            scrapedAt: new Date().toISOString(),
          };
          const tempPath = join(process.cwd(), "data", "scraped-products.json");
          await writeFile(tempPath, JSON.stringify(tempResult, null, 2));
          console.log(`  💾 Progress saved (${allProducts.length} products)`);
        }
      }
    } catch (error) {
      console.error(`  ❌ Error on product ${i + 1}:`, error);
      // Continue with next product
    }

    // Rate limiting: wait 3-5 seconds between products
    const delayMs = 3000 + Math.random() * 2000;
    await delay(delayMs);
  }

  await browser.close();

  const result: ScrapeResult = {
    products: allProducts,
    totalPages: currentPage - 1,
    scrapedAt: new Date().toISOString(),
  };

  // Save to file
  const outputDir = join(process.cwd(), "data");
  await mkdir(outputDir, { recursive: true });
  const outputPath = join(outputDir, "scraped-products.json");
  await writeFile(outputPath, JSON.stringify(result, null, 2));

  console.log(`\n✅ Scraping complete!`);
  console.log(`   Products scraped: ${allProducts.length}`);
  console.log(`   Output: ${outputPath}`);

  return result;
}

// Run scraper
scrapeAllProducts()
  .then(() => {
    console.log("✨ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Scraping failed:", error);
    process.exit(1);
  });
